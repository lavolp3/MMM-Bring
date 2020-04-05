/*jshint esversion: 6*/
Module.register("MMM-Bring", {

    defaults: {
        email: "",
        password: "",
        updateInterval: 15,
        listName: undefined,
        showListName: true,
        activeItemColor: "#EE524F",
        latestItemColor: "#4FABA2",
        showLatestItems: false,
        maxItems: 0,
        maxLatestItems: 0,
        inputField: true,
        locale: "de-DE"
    },

    getStyles: function () {
        return [
            this.file('css/styles.css'),
            this.file('node_modules/simple-keyboard/build/css/index.css')
        ];
    },

    getScripts: function () {
        return [
            this.file('node_modules/simple-keyboard/build/index.js')
        ];
    },



    start: function () {
        this.list = undefined;

        this.sendSocketNotification("GET_LIST", this.config);
        setInterval(() => {
            this.sendSocketNotification("GET_LIST", this.config);
        }, this.config.updateInterval * 60 * 1000);

    },

    notificationReceived: function (noti, payload) {
        if (noti = "MODULE_DOM_CREATED" && document.getElementById("bring-inputDiv")) {
          //console.log(document.getElementById("bring-inputDiv").innerHTML);
          var Keyboard = window.SimpleKeyboard.default;
          this.keyboard = new Keyboard({
            onChange: input => this.onChange(input),
            onKeyPress: button => this.onKeyPress(button),
            mergeDisplay: true,
            layoutName: "default",
            layout: {
              default: [
                "q w e r t y u i o p ü",
                "a s d f g h j k l ä",
                "{shift} z x c v b n m ö {backspace}",
                "{numbers} {space} {ent}"
              ],
              shift: [
                "Q W E R T Y U I O P Ü",
                "A S D F G H J K L Ä",
                "{shift} Z X C V B N M Ö {backspace}",
                "{numbers} {space} {ent}"
              ],
              numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"]
            },
            display: {
              "{numbers}": "123",
              "{ent}": "return",
              "{backspace}": "⌫",
              "{shift}": "⇧",
              "{abc}": "ABC"
            }
          });
        }
    },




    getDom: function () {
        const wrapper = document.createElement("div");
        wrapper.className = "bring-list-wrapper bring-" + this.data.position;

        const container = document.createElement("div");
        container.className = "bring-list-container bring-" + this.data.position;

        if (this.config.showListName && this.list && this.list.name) {
            const title = document.createElement("h3");
            title.innerText = this.list.name;
            container.appendChild(title);
        }

        // Purchase
        if (this.list && this.list.purchase) {
            const bringList = document.createElement("div");
            bringList.className = "bring-list";
            let max = this.list.purchase.length;
            if (this.config.maxItems !== 0) {
                max = this.config.maxItems;
            }
            for (let i = 0, len = max; i < len; i++) {
                const bringListItem = document.createElement("div");
                bringListItem.className = "bring-list-item-content";
                bringListItem.style = "background-color: " + this.config.activeItemColor;
                bringListItem.onclick = () => this.itemClicked({name: this.list.purchase[i].name, purchase: true, listId: this.list.uuid});

                const upperPartContainer = document.createElement("div");
                upperPartContainer.className = "bring-list-item-upper-part-container";
                const imageContainer = document.createElement("div");
                imageContainer.className = "bring-list-item-image-container";
                const image = document.createElement("img");
                image.src = this.list.purchase[i].imageSrc;
                imageContainer.appendChild(image);
                upperPartContainer.appendChild(imageContainer);

                bringListItem.appendChild(upperPartContainer);


                const itemTextContainer = document.createElement("div");
                itemTextContainer.className = "bring-list-item-text-container";
                const itemName = document.createElement("span");
                itemName.className = "bring-list-item-name";
                itemName.innerText = this.list.purchase[i].name;
                itemTextContainer.appendChild(itemName);

                const itemSpec = document.createElement("span");
                itemSpec.className = "bring-list-item-specification-label";
                itemSpec.innerText = this.list.purchase[i].specification;
                itemTextContainer.appendChild(itemSpec);

                bringListItem.appendChild(itemTextContainer);

                bringList.appendChild(bringListItem);
            }
            container.appendChild(bringList);
        }

        //recent
        if (this.config.showLatestItems && this.list && this.list.recently) {
            const bringListRecent = document.createElement("div");
            bringListRecent.className = "bring-list";

            let max = this.list.recently.length;
            if (this.config.maxLatestItems !== 0) {
                max = this.config.maxLatestItems;
            }
            for (let i = 0, len = max; i < len; i++) {
                const bringListItem = document.createElement("div");
                bringListItem.className = "bring-list-item-content";
                bringListItem.style = "background-color: " + this.config.latestItemColor;
                bringListItem.onclick = () => this.itemClicked({name: this.list.recently[i].name, purchase: false, listId: this.list.uuid});

                const upperPartContainer = document.createElement("div");
                upperPartContainer.className = "bring-list-item-upper-part-container";
                const imageContainer = document.createElement("div");
                imageContainer.className = "bring-list-item-image-container";
                const image = document.createElement("img");
                image.src = this.list.recently[i].imageSrc;
                imageContainer.appendChild(image);
                upperPartContainer.appendChild(imageContainer);

                bringListItem.appendChild(upperPartContainer);


                const itemTextContainer = document.createElement("div");
                itemTextContainer.className = "bring-list-item-text-container";
                const itemName = document.createElement("div");
                itemName.className = "bring-list-item-name";
                itemName.innerText = this.list.recently[i].name;
                itemTextContainer.appendChild(itemName);

                const itemSpec = document.createElement("div");
                itemSpec.className = "bring-list-item-specification-label";
                itemSpec.innerText = this.list.recently[i].specification;
                itemTextContainer.appendChild(itemSpec);

                bringListItem.appendChild(itemTextContainer);

                bringListRecent.appendChild(bringListItem);
                container.appendChild(bringListRecent);
            }
        }

        wrapper.appendChild(container);

        //input
        if (this.config.inputField) {
          var inputDiv = document.createElement("div");
          inputDiv.id = "bring-inputDiv";
          var input = document.createElement("input");
          input.id = "bring-inputField";
          input.setAttribute("type", "text");
          input.placeholder = "Click here to open keyboard!";
          input.addEventListener("input", event => {
              this.keyboard.setInput(event.target.value);
          });

          input.addEventListener("focus", event => {
            /*if (!this.keyboard) {
                  console.log("No keyboard detected. Initializing now.");
                  this.keyboard = new Keyboard({
                    onChange: input => this.onChange(input),
                    onKeyPress: button => this.onKeyPress(button),
                    mergeDisplay: true,
                    layoutName: "default",
            layout: {
              default: [
                "q w e r t y u i o p ü",
                "a s d f g h j k l ä",
                "{shift} z x c v b n m ö {backspace}",
                "{numbers} {space} {ent}"
              ],
              shift: [
                "Q W E R T Y U I O P Ü",
                "A S D F G H J K L Ä",
                "{shift} Z X C V B N M Ö {backspace}",
                "{numbers} {space} {ent}"
              ],
              numbers: ["1 2 3", "4 5 6", "7 8 9", "{abc} 0 {backspace}"]
            },
            display: {
              "{numbers}": "123",
              "{ent}": "return",
              "{backspace}": "⌫",
              "{shift}": "⇧",
              "{abc}": "ABC"
            }
            });
            //Add event listener on first implementation of keyboard.
            document.addEventListener("click", event => {
            if ( event.target !== this.keyboard.keyboardDOM && event.target.id !== "bring-inputField" && !event.target.classList.contains("hg-button")) {
                this.hideKeyboard();
            }
            });
            }*/
          });

          var send = document.createElement("button");
          send.className = "bring-sendButton";
          send.innerText = "Add to List!";
          send.setAttribute("name", "sendPurchase");
          send.onclick = () => {
              var addItem = document.getElementById("bring-inputField").value;
              if (addItem !== '') {
                  //capitalize first letter
                  addItem = addItem.charAt(0).toUpperCase() + addItem.substring(1);
                  console.log("[MM-Bring] "+addItem + " added to List!");
                  this.itemClicked({name: addItem, purchase: false, listId: this.list.uuid});
              } else {
                  console.log("[MMM-Bring] Nothing entered to add to the List!");
              }
          };
          inputDiv.appendChild(input);
          inputDiv.appendChild(send);

          const kb = document.createElement("div");
          kb.className = "simple-keyboard";
          inputDiv.appendChild(kb);
          wrapper.appendChild(inputDiv);
        }
        return wrapper;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "LIST_DATA") {
            this.list = payload;
            this.updateDom(1000);
        } else  if (notification === "RELOAD_LIST") {
            this.sendSocketNotification("GET_LIST", this.config);
        }
    },

    itemClicked: function (item) {
        this.sendSocketNotification("PURCHASED_ITEM", item);
    },


    // KEYBOARD
    onChange: function(input) {
        document.getElementById("bring-inputField").value = input;
    },

    onKeyPress: function(button) {
        /**
         * If you want to handle the shift and caps lock buttons
         */
        if (button === "{shift}" || button === "{lock}") this.handleShift();
        if (button === "{numbers}" || button === "{abc}") handleNumbers();
    },

    handleNumbers: function() {
        let currentLayout = this.keyboard.options.layoutName;
        let numbersToggle = currentLayout !== "numbers" ? "numbers" : "default";

        this.keyboard.setOptions({
            layoutName: numbersToggle
        });

        this.showKeyboard();
    },

    handleShift: function() {
        let currentLayout = this.keyboard.options.layoutName;
        let shiftToggle = currentLayout === "default" ? "shift" : "default";

        this.keyboard.setOptions({
            layoutName: shiftToggle
        });

        this.showKeyboard();
    },



    showKeyboard: function() {
        this.keyboard.keyboardDOM.classList.remove("bring-hide-keyboard");
        console.log("Show Keyboard!");
    },

    hideKeyboard: function() {
        this.keyboard.keyboardDOM.classList.add("bring-hide-keyboard");
        console.log("Keyboard hidden!");
    }

});
