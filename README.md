# Ollama Model Manager (WIP)

a simple and minimalistic UI for managing Ollama models.

## Install
### Native
download/clone the git repository and open it.

    pip install -r requirements.txt
    cd backend
    python .\manage.py runserver
open [127.0.0.1:8000](127.0.0.1:8000) in your browser.

### Docker
download/clone the git repository and build it.
```sh
git clone https://github.com/endo9000/OllaMoMa.git
cd OllaMoMa
docker build . -t ollamoma
```
Running:
```sh
docker run -p 8000:8000 --name ollamoma ollamoma
```

## Implemented Features
- search bar
- sort menu
- edit model file (need indicator while saving)
- edit rename
- edit duplicate
- delete model
- darkreader compatibility (extension)

## In Progress
- notifications 

## Potential Features
- menu bar
- themes (darkmode)
- docker
- native desktop app
- search bar with ollama library integration
- favourite models
- shortcuts
