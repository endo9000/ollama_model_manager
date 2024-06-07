# views.py
import json
import requests
import ollama
from django.http import HttpResponse
from django.shortcuts import render

BASE_URL = "http://localhost:11434"

def index(request):
    """Render the index page with a list of models"""
    models = get_model_list()
    return render(request, "index.html", {"model_list": models})


def get_status(request):
    """Get the status of Ollama"""
    try:
        response = requests.get(f"{BASE_URL}/")
        response.raise_for_status()
        return HttpResponse( 
            json.dumps({"status": "Ollama is running"}),
            content_type="application/json")
    except Exception as e:
        return [{"error": str(e)}]


def get_model_list():
    """Get a list of models from the API"""
    try:
        return [
            dict(
                model,
                **{
                    "showInfoPage": True,
                    "showModelPage": False,
                    "confirmRename": False,
                    "confirmCopy": False,
                    "confirmDelete": False,
                    "modelFile": None,
                },
            )
            for model in ollama.list()["models"]
        ]
    except Exception as e:
        print(e)
        return []


def get_model_file(request, model_name: str):
    """Get a modelfile from the API"""
    try:
        modelFile =  ollama.show(model_name).get("modelfile")
        # print(modelFile)
        return HttpResponse(modelFile)
    except requests.exceptions.RequestException as e:
        return [{"error": str(e)}]
    
    
def save_model_file(request, model_name: str):
    """Get a modelfile from the API"""
    try:
        body = request.body.decode('utf-8')
        json_body =  json.loads(body)
        progress = ollama.create(model_name, modelfile=json_body['modelFile'], stream=True)
        for line in progress:
            print(line)
        return HttpResponse("ok")
    except requests.exceptions.RequestException as e:
        return [{"error": str(e)}]


def copy_model(request, model_name: str, new_model_name: str):
    """Copy a model from the API"""
    try:
        ollama.copy(model_name, new_model_name)
        return HttpResponse(
            json.dumps({"status": "Model copied successfully"}),
            content_type="application/json",
        )
    except requests.exceptions.RequestException as e:
        return HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            content_type="application/json",
        )


def delete_model(request, model_name: str):
    """Delete a model from the API"""
    try:
        ollama.delete(model_name)
        return HttpResponse(
            json.dumps({"status": "Model deleted successfully"}),
            content_type="application/json",
        )
    except requests.exceptions.RequestException as e:
        return HttpResponse(
            json.dumps({"error": str(e)}),
            status_code=500,
            content_type="application/json",
        )