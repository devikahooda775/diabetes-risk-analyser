document.getElementById("diabetesForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = {
    name: document.getElementById("name").value,
    age: document.getElementById("age").value,
    glucose: parseFloat(document.getElementById("glucose").value),
    bloodPressure: parseFloat(document.getElementById("bloodPressure").value),
    bmi: parseFloat(document.getElementById("bmi").value),
    insulin: parseFloat(document.getElementById("insulin").value),
  };

  try {
    const response = await fetch("/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) throw new Error("Network response was not ok");

    const result = await response.json();
    document.getElementById("result").innerHTML = `<h2>Predicted Dosage: ${result.dosage}</h2>`;
  } catch (err) {
    console.error(err);
    document.getElementById("result").innerHTML = `<h2 style="color:red">Error: ${err.message}</h2>`;
  }
});
