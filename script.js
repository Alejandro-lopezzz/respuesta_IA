const GEMINI_API_KEY = "AIzaSyCqRRtLSaWmA1Ad-T6x-feOgPX_uBvhZyU";
    const COHERE_API_KEY = "q6V8qrwsWnNqfFytGxXHXMxejxgPUv6se0E3TVLx";

    // Función para mostrar el modal
    function showSentimentModal(sentiment, aiName) {
      const modal = document.getElementById('sentimentModal');
      const modalContent = document.getElementById('modalContent');
      const modalIcon = document.getElementById('modalIcon');
      const modalTitle = document.getElementById('modalTitle');
      const modalMessage = document.getElementById('modalMessage');
      
      if (sentiment === 'positivo') {
        modalContent.className = 'modal-content modal-positivo';
        modalIcon.textContent = '😊';
        modalTitle.textContent = 'Respuesta Positiva';
        modalMessage.textContent = `${aiName} ha dado una respuesta con sentimiento positivo.  :)`;
      } else if (sentiment === 'negativo') {
        modalContent.className = 'modal-content modal-negativo';
        modalIcon.textContent = '😔';
        modalTitle.textContent = 'Respuesta Negativa';
        modalMessage.textContent = `${aiName} ha dado una respuesta con sentimiento negativo.  :(`;
      }
      
      modal.style.display = 'block';
    }
    
    // Función para cerrar el modal
    function closeModal() {
      document.getElementById('sentimentModal').style.display = 'none';
    }
    
    // Cerrar modal al hacer clic fuera de él
    window.onclick = function(event) {
      const modal = document.getElementById('sentimentModal');
      if (event.target === modal) {
        modal.style.display = 'none';
      }
    }
    function analyzeSentiment(text) {
      const positiveWords = ['bueno', 'excelente', 'fantástico', 'genial', 'perfecto', 'maravilloso', 'increíble', 'positivo', 'sí', 'correcto', 'bien', 'mejor', 'gran', 'feliz', 'alegre'];
      const negativoWords = ['malo', 'terrible', 'horrible', 'pésimo', 'negativo', 'no', 'incorrecto', 'mal', 'peor', 'triste', 'problema', 'error', 'difícil', 'imposible'];
      
      const textLower = text.toLowerCase();
      let positiveCount = 0;
      let negativoCount = 0;
      
      positiveWords.forEach(word => {
        if (textLower.includes(word)) positiveCount++;
      });
      
      negativoWords.forEach(word => {
        if (textLower.includes(word)) negativoCount++;
      });
      
      if (positiveCount > negativoCount) return 'positive';
      if (negativoCount > positiveCount) return 'negativo';
      return 'neutral';
    }

    async function sendToAIs() {
      const input = document.getElementById("inputText").value;
      const loader = document.getElementById("loader");
      const responseGemini = document.getElementById("responseGemini");
      const responseCohere = document.getElementById("responseCohere");

      if (!input.trim()) {
        responseGemini.textContent = "Por favor, ingresa un texto.";
        responseCohere.textContent = "Por favor, ingresa un texto.";
        return;
      }

      loader.style.display = "block";
      responseGemini.textContent = "";
      responseCohere.textContent = "";

      const geminiFetch = fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: input }] }]
          })
        }
      )
      .then(res => res.json())
      .then(data => {
        if (data.candidates?.[0]?.content?.parts?.[0]?.text) {
          return data.candidates[0].content.parts[0].text;
        } else {
          console.warn("Gemini response:", data);
          return "No se obtuvo respuesta válida de Gemini.";
        }
      })
      .catch(err => {
        console.error("Error con Gemini:", err);
        return "Error al conectar con Gemini.";
      });

      const cohereFetch = fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${COHERE_API_KEY}`
        },
        body: JSON.stringify({
          model: "command-r-plus",
          message: input,
          temperature: 0.7
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.text) {
          return data.text;
        } else {
          console.warn("Cohere response:", data);
          return "No se obtuvo respuesta válida de Cohere.";
        }
      })
      .catch(err => {
        console.error("Error con Cohere:", err);
        return "Error al conectar con Cohere.";
      });

      // ✅ PUNTO CLAVE: Aquí es donde recibes las respuestas de ambas IA
      const [geminiResponse, cohereResponse] = await Promise.all([geminiFetch, cohereFetch]);

      loader.style.display = "none";

      // ✅ AQUÍ PUEDES AGREGAR TUS CONDICIONALES
      // Analizar el sentimiento de cada respuesta
      const respuestaG = analyzeSentiment(geminiResponse);
      const respuestaC = analyzeSentiment(cohereResponse);

      // ✅ CONDICIONALES PARA MOSTRAR VENTANAS MODALES
      if (respuestaG === 'positivo') {
        showSentimentModal('positivo', 'Gemini');
      } else if (respuestaG === 'negativo') {
        showSentimentModal('negativo', 'Gemini');
      }

      if (respuestaC === 'positivo') {
        setTimeout(() => showSentimentModal('positivo', 'Cohere'), 1000);
      } else if (respuestaC === 'negativo') {
        setTimeout(() => showSentimentModal('negativo', 'Cohere'), 1000);
      }

      // Aplicar estilos según el sentimiento
      respuestaG.className = `responseContainer ${respuestaG}`;
      respuestaC.className = `responseContainer ${respuestaC}`;

      // Mostrar las respuestas con información adicional sobre el sentimiento
      responseGemini.textContent = `[${respuestaG.toUpperCase()}] ${geminiResponse}`;
      responseCohere.textContent = `[${respuestaC.toUpperCase()}] ${cohereResponse}`;
    }