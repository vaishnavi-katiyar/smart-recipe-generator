// =============================
// Smart Recipe Generator
// =============================

// Expanded recipe database (20 recipes) → each recipe includes metadata
const recipes = [
    {
      name: "Vegetable Stir Fry",
      ingredients: ["broccoli", "carrot", "soy sauce"],
      diet: "vegan",
      time: 20,
      difficulty: "easy",
      nutrition: { calories: 250, protein: "10g" },
      steps: ["Chop vegetables", "Stir fry in a wok", "Add soy sauce"]
    },
    {
      name: "Chicken Curry",
      ingredients: ["chicken", "onion", "tomato", "spices"],
      diet: "any",
      time: 45,
      difficulty: "medium",
      nutrition: { calories: 450, protein: "35g" },
      steps: ["Cook onions & spices", "Add chicken & tomatoes", "Simmer until done"]
    },
    {
      name: "Vegan Chili",
      ingredients: ["beans", "tomato", "onion", "spices"],
      diet: "vegan",
      time: 50,
      difficulty: "medium",
      nutrition: { calories: 420, protein: "16g" },
      steps: ["Cook onion & spices", "Add beans & tomato", "Simmer until thick"]
    }
    // ... (extend with 20 total recipes)
  ];
  
  // Substitution dictionary
  const substitutions = {
    milk: "almond milk / soy milk",
    butter: "olive oil / coconut oil",
    chicken: "tofu / mushrooms",
    beef: "lentils / jackfruit",
    egg: "flaxseed meal (vegan option)",
    cheese: "nutritional yeast (vegan option)",
    bread: "gluten-free bread"
  };
  
  // State
  let userIngredients = [];
  
  // =============================
  // Ingredient Handling
  // =============================
  
  document.getElementById("addIngredientBtn").addEventListener("click", () => {
    const input = document.getElementById("ingredientInput");
    if (input.value.trim() !== "") {
      userIngredients.push(input.value.trim().toLowerCase());
      updateIngredientList();
      input.value = "";
    }
  });
  
  function updateIngredientList() {
    const list = document.getElementById("ingredientList");
    list.innerHTML = "";
    userIngredients.forEach((ing, index) => {
      const li = document.createElement("li");
      li.textContent = ing;
      li.addEventListener("click", () => {
        userIngredients.splice(index, 1);
        updateIngredientList();
      });
      list.appendChild(li);
    });
  }
  
  // =============================
  // Loader Spinner
  // =============================
  
  function showLoading() {
    const container = document.getElementById("recipesContainer");
    container.innerHTML = `
      <div style="text-align:center;">
        <div class="spinner" style="border:4px solid #f3f3f3; border-top:4px solid #ff7043; border-radius:50%; width:30px; height:30px; animation: spin 1s linear infinite; margin:auto;"></div>
        <p>⏳ Generating recipes...</p>
      </div>
    `;
  }
  
  const style = document.createElement("style");
  style.innerHTML = `
  @keyframes spin {
    0% { transform: rotate(0deg);}
    100% { transform: rotate(360deg);}
  }`;
  document.head.appendChild(style);
  
  // =============================
  // Recipe Generation
  // =============================
  
  document.getElementById("generateBtn").addEventListener("click", () => {
    showLoading();
  
    setTimeout(() => {
      const diet = document.getElementById("dietFilter").value;
      const time = document.getElementById("timeFilter").value;
      const difficulty = document.getElementById("difficultyFilter").value;
  
      const results = recipes.filter(r => {
        const matchesIngredients =
          userIngredients.length === 0 ||
          userIngredients.some(i => r.ingredients.includes(i));
        const matchesDiet = diet === "any" || r.diet === diet;
        const matchesTime = time === "any" || r.time <= parseInt(time);
        const matchesDifficulty = difficulty === "any" || r.difficulty === difficulty;
  
        return matchesIngredients && matchesDiet && matchesTime && matchesDifficulty;
      });
  
      displayRecipes(results);
    }, 1000);
  });
  
  function displayRecipes(results) {
    const container = document.getElementById("recipesContainer");
    container.innerHTML = "";
  
    if (results.length === 0) {
      let suggestionText = "";
      userIngredients.forEach(ing => {
        if (substitutions[ing]) {
          suggestionText += `<li>${ing} → Try: ${substitutions[ing]}</li>`;
        }
      });
  
      container.innerHTML = `
        <p>No recipes found. Try different ingredients or filters.</p>
        ${suggestionText ? `<p>🔄 Substitution Suggestions:</p><ul>${suggestionText}</ul>` : ""}
      `;
      return;
    }
  
    results.forEach(r => {
      const card = document.createElement("div");
      card.classList.add("recipe-card");
  
      card.innerHTML = `
        <h3>${r.name}</h3>
        <p><strong>Time:</strong> ${r.time} mins | <strong>Difficulty:</strong> ${r.difficulty}</p>
        <p><strong>Nutrition:</strong> ${r.nutrition.calories} kcal, ${r.nutrition.protein} protein</p>
        <p><strong>Steps:</strong></p>
        <ol>${r.steps.map(s => `<li>${s}</li>`).join("")}</ol>
        <div class="recipe-actions">
          <button onclick="saveRecipe('${r.name}')">Save ⭐</button>
        </div>
      `;
  
      container.appendChild(card);
    });
  }
  
  // =============================
  // Cloud Save (MongoDB)
  // =============================
  
  // Save recipe via backend API
  async function saveRecipe(name) {
    const recipe = recipes.find(r => r.name === name);
  
    try {
      const response = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(recipe)
      });
  
      if (response.ok) {
        alert("✅ Recipe saved to cloud!");
        fetchSavedRecipes();
      } else {
        alert("⚠️ Failed to save recipe.");
      }
    } catch (error) {
      console.error(error);
      alert("⚠️ Error saving recipe.");
    }
  }
  
  // Fetch saved recipes from backend
  async function fetchSavedRecipes() {
    try {
      const response = await fetch("/api/recipes");
      const savedRecipes = await response.json();
  
      const container = document.getElementById("savedRecipes");
      container.innerHTML = "";
  
      savedRecipes.forEach(r => {
        const card = document.createElement("div");
        card.classList.add("recipe-card");
        card.innerHTML = `<h3>${r.name}</h3><p>Saved recipe ✅</p>`;
        container.appendChild(card);
      });
    } catch (error) {
      console.error(error);
    }
  }
  
  // Run on load
  fetchSavedRecipes();
  
  // =============================
  // HuggingFace Ingredient Recognition (via backend)
  // =============================
  
  document.getElementById("uploadImageBtn").addEventListener("click", async () => {
    const fileInput = document.getElementById("imageInput");
    if (!fileInput.files.length) {
      alert("Please select an image first.");
      return;
    }
  
    showLoading();
  
    const file = fileInput.files[0];
    const imageBytes = await file.arrayBuffer();
  
    try {
      const response = await fetch("/api/recognize", {
        method: "POST",
        body: imageBytes
      });
  
      const result = await response.json();
  
      if (result.error) {
        document.getElementById("recipesContainer").innerHTML =
          `<p>⚠️ Error: ${result.error}</p>`;
        return;
      }
  
      const caption = result[0].generated_text.toLowerCase();
      console.log("Image caption:", caption);
  
      const possibleIngredients = caption
        .split(" ")
        .filter(word =>
          ["tomato","onion","rice","chicken","broccoli","carrot","cheese","bread",
           "egg","beef","fish","shrimp","tofu","mushroom","lettuce","cucumber","potato",
           "beans","lentils","quinoa","avocado","milk"].includes(word)
        );
  
      if (possibleIngredients.length > 0) {
        possibleIngredients.forEach(ing => {
          if (!userIngredients.includes(ing)) {
            userIngredients.push(ing);
          }
        });
        updateIngredientList();
        document.getElementById("recipesContainer").innerHTML =
          `<p>✅ Detected ingredients: ${possibleIngredients.join(", ")}</p>`;
      } else {
        document.getElementById("recipesContainer").innerHTML =
          `<p>⚠️ Could not detect clear ingredients. Try another image.</p>`;
      }
  
    } catch (error) {
      console.error(error);
      document.getElementById("recipesContainer").innerHTML =
        `<p>⚠️ Failed to process image.</p>`;
    }
  });

  document.getElementById("detect-btn").addEventListener("click", async () => {
    const fileInput = document.getElementById("image-upload");
    if (!fileInput.files.length) {
      alert("Upload an image first!");
      return;
    }
  
    const file = fileInput.files[0];
    const reader = new FileReader();
  
    reader.onloadend = async () => {
      try {
        const res = await fetch("/api/detect", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: reader.result }),
        });
  
        const data = await res.json();
        console.log("Ingredients detected:", data);
        alert("Detected: " + (data[0]?.generated_text || "No ingredients found"));
      } catch (err) {
        console.error(err);
        alert("Ingredient detection failed");
      }
    };
  
    reader.readAsDataURL(file); // Convert to Base64
  });
  