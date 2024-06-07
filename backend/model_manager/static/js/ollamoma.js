document.addEventListener("alpine:init", () => {
  Alpine.data("modelData", () => ({
    searchNeedle: "",
    modelList: JSON.parse(
      document.getElementById("model_list").textContent
    ).sort((a, b) => a.name.localeCompare(b.name)),
    sortBy: "name",
    selectedModel: null,
    sortDirection: 1,
    nameDescending: false,
    filesizeDescending: false,
    paramsizeDescending: false,
    lastdateDescending: true,
    ollamaRunning: false,

    convertParamsToNumeric(param) {
      const units = { M: 1000000, B: 1000000000, K: 1000 };
      const value = parseFloat(param.slice(0, -1));
      const unit = param[param.length - 1];
      return value * (units[unit] || 1);
    },

    formatDate(dateString) {
      const date = new Date(dateString);
      const now = new Date();
      const ago = Math.floor((now - date) / (1000 * 3600 * 24));
      return `${date.toLocaleDateString()}${ago === 0 ? " (today)" : ago === 1 ? " (1 day ago)" : ` (${ago} days ago)`}`;
    },

    formatSize(size) {
      const bytes = parseInt(size);
      const kbSize = bytes / 1024;
      const mbSize = kbSize / 1024;
      const gbSize = mbSize / 1024;
      if (gbSize >= 1.5) {
        return `${gbSize.toFixed(2)} GB`;
      } else if (mbSize >= 1) {
        return `${mbSize.toFixed(2)} MB`;
      } 
    },

    sort(by) {
      this.sortBy = by;
      const direction = this.sortDirection;
      switch (by) {
        case "name":
          this.modelList.sort((a, b) => a.name.localeCompare(b.name) * direction);
          this.nameDescending = !this.nameDescending;
          break;
        case "filesize":
          this.modelList.sort((a, b) => (direction === 1 ? a.size - b.size : b.size - a.size));
          this.filesizeDescending = !this.filesizeDescending;
          break;
        case "paramsize":
          this.modelList.sort((a, b) =>
            (direction === 1
              ? this.convertParamsToNumeric(a.details.parameter_size) - this.convertParamsToNumeric(b.details.parameter_size)
              : this.convertParamsToNumeric(b.details.parameter_size) - this.convertParamsToNumeric(a.details.parameter_size))
          );
          this.paramsizeDescending = !this.paramsizeDescending;
          break;
        case "lastmod":
          this.modelList.sort((a, b) => a.modified_at.localeCompare(b.modified_at) * direction);
          this.lastdateDescending = !this.lastdateDescending;
          break;
      }
      this.sortDirection = -this.sortDirection;
    },

    getStatus() {
      fetch(`get-status/`, {
        method: "GET",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }).then(() => {
        ollamaRunning = true;
      });
    },

    fetchModelFile(model) {
      this.selectedModel = model;
      if (!model.modelFile) {
        fetch(`get-model-file/${model.name}/`)
          .then((response) => response.text())
          .then((file) => {
            model.modelFile = file;
          });
      }
    },

    turnToInput(modelName) {
      document.getElementById(`name_${modelName}`).closest("input").remove();
      document.getElementById(
        `name_${modelName}`
      ).innerHTML = `<input type='text' value='${modelName}' />`;
    },

    resetModel(modelName, modelFile) {
      document.getElementById(`textarea-${modelName}-1`).value = modelFile;
    },

    saveModelFile(modelName) {
      const modelFile = document.getElementById(
        `textarea-${modelName}-1`
      ).value;
      // console.log("modelfile here!", modelFile);
      fetch(`/save-model-file/${modelName}/`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCookie("csrftoken"),
        },
        body: JSON.stringify({ modelFile: modelFile }),
      }).then(() => {});
    },

    copyModel(modelName, newModelName) {
      console.log("copying model", modelName, newModelName);
      if (!newModelName || newModelName === "") {
        alert("Please enter a new model name!");
        return;
      }
      return fetch(`/copy-model/${modelName}/${newModelName}/`, {
        method: "POST",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCookie("csrftoken"),
        },
      });
    },

    deleteModel(modelName) {
      fetch(`/delete-model/${modelName}/`, {
        method: "DELETE",
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
          "X-CSRFToken": this.getCookie("csrftoken"),
        },
      }).then(() => {
        console.log(`${modelName} deleted!`);
        document.getElementById(modelName).remove();
      });
    },

    renameModel(modelName, newModelName) {
      this.copyModel(modelName, newModelName)
        .then((e) => {
          console.log(`${modelName} copied to ${newModelName}!`, e);
          this.deleteModel(modelName);
          alert(`${modelName} renamed to ${newModelName}!`, e);

        })
        .catch((e) => {
          alert("Error duplicating model:", e);
        });
    },

    duplicateModel(modelName, newModelName) {
      this.copyModel(modelName, newModelName)
        .then((e) => {
          console.log(`${modelName} copied to ${newModelName}!`, e);
          alert(`${modelName} copied to ${newModelName}!`, e);
        })
        .catch((e) => {
          alert("Error duplicating model:", e);
        });
    },

    getCookie(name) {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop().split(";").shift();
    },
  }));


  Alpine.data("textareaData", () => ({
    counter: 0,
  }));
});
