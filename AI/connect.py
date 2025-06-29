print("Starting Flask AI Server...")
from flask import Flask, request, jsonify
from flask_cors import CORS
from groq import Groq
import os
from dotenv import load_dotenv

load_dotenv()

Groq_API_KEY = os.getenv("GROQ_API_KEY")
print("loaded API key", Groq_API_KEY)

app = Flask(__name__)
CORS(app)

client = Groq(api_key=Groq_API_KEY)

@app.route('/classify' , methods = ['POST'])

def classify_fir():
    data = request.json
    description = data.get("incidentDescription" , "")

    if not description:
        return jsonify({"error" : "No description provided"}) , 400
    
    prompt =f"""You are a crime analysis assistant.

Your job is to classify an FIR description into one of the following categories:
- High: Life-threatening crimes such as murder, rape, terrorism, serious assault, bomb threats
- Medium: Significant crimes like robbery, theft, hacking, fraud
- Low: Minor issues such as lost items, noise complaints, or littering

Only respond with a single word: High, Medium, or Low.

FIR Description: {description}
Priority:"""




    try:
        response = client.chat.completions.create(
            model = "llama3-8b-8192",
            messages = [{"role":"user" , "content" : prompt}],
            temperature = 0,
            max_tokens=10            
        )

        priority = response.choices[0].message.content.strip()
        print("AI Response:", response.choices[0].message.content)
        priority = priority.lower()
        if "high" in priority:
            priority = "high"
        elif "medium" in priority:
            priority = "medium"
        elif "low" in priority:
            priority = "low"
        else:
            priority = 'low'
        

        print("Prompt sent to AI:\n", prompt)
        print("Full AI Response Object:\n", response)



        return jsonify({"priority":priority})
    except Exception as e:
        return jsonify({"error" : str(e)}) ,500

if __name__ == "__main__":
    app.run(debug=True , port=5050)


