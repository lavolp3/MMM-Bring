/*jshint esversion: 6 */
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
        locale: "de-DE"
    },

    getStyles: function () {
        return [this.file('css/styles.css')];
    },

    start: function () {
        this.sendSocketNotification("GET_LIST", this.config);
        setInterval(() => {
            this.sendSocketNotification("GET_LIST", this.config);
        }, this.config.updateInterval * 60 * 1000);
        this.lists = ["Liste1", "Liste2"];
    },

    createDropDown: function() {
        const drop = document.createElement("div");
        drop.className = "bring-dropdown-title";
        const titleBtn = document.createElement("input");
        titleBtn.setAttribute("type", "button");
        titleBtn.className = "bring-titleBtn bright";
        titleBtn.value = this.config.listName +  " \u2BC6";
        titleBtn.addEventListener("click", function () {
            document.getElementById("bring-dropItems").classList.toggle("show");
        });
        const dropList = document.createElement("div");
        dropList.id = "bring-dropList";
        const dropItems = document.createElement("div");
        dropItems.id = "bring-dropItems";
        var self = this;
        for (var i = 0; i < this.lists.length; i++) {
            var dropItem = document.createElement("div");
            dropItem.className = "bring-dropItem";
            dropItem.innerHTML = this.lists[i].name;
            dropItem.addEventListener("click", function() {
                self.config.listName = this.innerHTML;
                self.sendSocketNotification("GET_LIST", self.config);
            });
            dropItems.appendChild(dropItem);
        }
        dropList.appendChild(dropItems);
        drop.appendChild(titleBtn);
        drop.appendChild(dropList);
        return drop;
    },

    getDom: function () {
        const container = document.createElement("div");
        container.className = "bring-list-container bring-" + this.data.position;

        if (this.config.showListName && this.currentList && this.currentList.name) {

            const dropTitle = this.createDropDown();
            document.addEventListener("click", event => {
                if (!event.target.matches('.bring-titleBtn')) {
                    var dropDown = document.getElementById("bring-dropItems");
                    if (dropDown.classList.contains('show')) {
                        dropDown.classList.remove('show');
                    }
                    /*var dropdowns = document.getElementsByClassName("dropdown-content");
                    var i;
                    for (i = 0; i < dropdowns.length; i++) {
                        var openDropdown = dropdowns[i];
                        if (openDropdown.classList.contains('show')) {
                            openDropdown.classList.remove('show');
                        }
                    }*/
                }
            });
            container.appendChild(dropTitle);
        }

        // Purchase
        if (this.currentList && this.currentList.purchase) {
            const bringList = document.createElement("div");
            bringList.className = "bring-list";
            let max = this.currentList.purchase.length;
            if (this.config.maxItems !== 0) {
                max = this.config.maxItems;
            }
            for (let i = 0, len = max; i < len; i++) {
                const bringListItem = document.createElement("div");
                bringListItem.className = "bring-list-item-content";
                bringListItem.style = "background-color: " + this.config.activeItemColor;
                bringListItem.onclick = () => this.itemClicked({name: this.currentList.purchase[i].name, purchase: true, listId: this.currentList.uuid});

                const upperPartContainer = document.createElement("div");
                upperPartContainer.className = "bring-list-item-upper-part-container";
                const imageContainer = document.createElement("div");
                imageContainer.className = "bring-list-item-image-container";
                const image = document.createElement("img");
                image.src = this.currentList.purchase[i].imageSrc;
                imageContainer.appendChild(image);
                upperPartContainer.appendChild(imageContainer);

                bringListItem.appendChild(upperPartContainer);


                const itemTextContainer = document.createElement("div");
                itemTextContainer.className = "bring-list-item-text-container";
                const itemName = document.createElement("span");
                itemName.className = "bring-list-item-name";
                itemName.innerText = this.currentList.purchase[i].name;
                itemTextContainer.appendChild(itemName);

                const itemSpec = document.createElement("span");
                itemSpec.className = "bring-list-item-specification-label";
                itemSpec.innerText = this.currentList.purchase[i].specification;
                itemTextContainer.appendChild(itemSpec);

                bringListItem.appendChild(itemTextContainer);

                bringList.appendChild(bringListItem);
            }
            container.appendChild(bringList);
        }
        if (this.config.showLatestItems && this.currentList && this.currentList.recently) {
            const bringListRecent = document.createElement("div");
            bringListRecent.className = "bring-list";

            let max = this.currentList.recently.length;
            if (this.config.maxLatestItems !== 0) {
                max = this.config.maxLatestItems;
            }
            for (let i = 0, len = max; i < len; i++) {
                const bringListItem = document.createElement("div");
                bringListItem.className = "bring-list-item-content";
                bringListItem.style = "background-color: " + this.config.latestItemColor;
                bringListItem.onclick = () => this.itemClicked({name: this.currentList.recently[i].name, purchase: false, listId: this.currentList.uuid});

                const upperPartContainer = document.createElement("div");
                upperPartContainer.className = "bring-list-item-upper-part-container";
                const imageContainer = document.createElement("div");
                imageContainer.className = "bring-list-item-image-container";
                const image = document.createElement("img");
                image.src = this.currentList.recently[i].imageSrc;
                imageContainer.appendChild(image);
                upperPartContainer.appendChild(imageContainer);

                bringListItem.appendChild(upperPartContainer);


                const itemTextContainer = document.createElement("div");
                itemTextContainer.className = "bring-list-item-text-container";
                const itemName = document.createElement("div");
                itemName.className = "bring-list-item-name";
                itemName.innerText = this.currentList.recently[i].name;
                itemTextContainer.appendChild(itemName);

                const itemSpec = document.createElement("div");
                itemSpec.className = "bring-list-item-specification-label";
                itemSpec.innerText = this.currentList.recently[i].specification;
                itemTextContainer.appendChild(itemSpec);

                bringListItem.appendChild(itemTextContainer);

                bringListRecent.appendChild(bringListItem);
                container.appendChild(bringListRecent);
            }
        }
        return container;
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "LIST_DATA") {
            this.currentList = payload.currentList;
            this.lists = payload.lists;
            if (!this.config.listName) {
                this.config.listName = this.currentList.name;
            }
            //console.log(JSON.stringify(this.lists));
            this.updateDom(1000);
        }
    },

    itemClicked: function (item) {
        this.sendSocketNotification("PURCHASED_ITEM", item);
    }

});
