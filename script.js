/*jshint esversion:6 */

class UIwindow {
    constructor(numberOfArea) {
        this.name = "default window";

        this.window = document.createElement('div');
        this.window.classList.add('window');

        this.controlBar = document.createElement('div');
        this.controlBar.classList.add('window__controlBar');

        this.windowName = document.createElement('p');
        this.windowName.classList.add('window__name');
        this.windowName.innerHTML = this.name;

        this.controlBar.append(this.windowName);

        this.pageSelector = document.createElement('ul');
        this.pageSelector.classList.add('pageSelector');
        this.pageSelectorCall = document.createElement('p');
        this.pageSelectorCall.classList.add('pageSelectorCall');
        this.pageSelectorCall.innerHTML = "Страницы";
        var span = document.createElement('span');

        this.pageSelectorCall.append(this.pageSelector);
        this.pageSelectorCall.append(span);
        this.controlBar.append(this.pageSelectorCall);

        this.legend = document.createElement('div');
        this.legend.classList.add('window__legend');

        this.displayArea = document.createElement('div');
        this.displayArea.classList.add('window__displayArea');

        this.buttons = document.createElement('wrapper');
        this.buttons.classList.add('window__buttons');
        for (let i = 0; i < 3; i++) {
            let button = document.createElement('div');
            button.classList.add('window__button');
            switch (i) {
                case 0:
                    button.classList.add('hide');
                    addEventHandler(button, this, "hide");
                    break;
                case 1:
                    button.classList.add('resize');
                    addEventHandler(button, this, "resize");
                    break;
                case 2:
                    button.classList.add('close');
                    addEventHandler(button, this, "close");
                    break;
            }
            this.buttons.append(button);
        }

        this.controlBar.append(this.buttons);
        this.window.append(this.controlBar);
        this.window.append(this.legend);
        this.window.append(this.displayArea);

        var allAreas = document.querySelectorAll('.workspace__area');
        var min = Infinity;
        if (numberOfArea === undefined) {
            for (let i = 0; i < allAreas.length; i++) {
                if (allAreas[i].children.length < min) {

                    allAreas[i].append(this.window);
                    min = allAreas[i].children.length;
                }
            }
        } else {
            if(numberOfArea > allAreas.length) {
                alert("Неправильный номер зоны для append, выберите номер от 0 до " + allAreas.length +". Номер - не обязательный аргумент для создания окна");
            }
            for (let i = 0; i < allAreas.length; i++) {
                allAreas[numberOfArea].append(this.window);
            }
        }


        function addEventHandler(eventTarget, object, eventType) {
            eventTarget.addEventListener('click', function () {
                if (eventType == "close") {
                    object.close();
                } else if (eventType == "resize") {
                    object.resize();
                } else if (eventType == "hide") {
                    object.hide();
                }
            }, false);
        }
    }
    close() {
        this.window.style.display = "none";
    }
    hide() {
        let parent = this.window.parentNode;
        this.window.querySelector('.window__buttons').style.display = "none";
        this.window.classList.add('hidden');
        document.querySelector('.hideBar').append(this.window);
        let window = this.window;
        let wasAbsolute;
        if (this.window.style.position == "absolute") {
            wasAbsolute = 1;
            this.window.style.position = "relative";
        }

        setTimeout(function run() {
            window.addEventListener('click', function () {
                if (wasAbsolute === 1) {
                    this.style.position = "absolute";
                }
                this.classList.remove('hidden');
                this.querySelector('.window__buttons').style.display = "flex";
                parent.append(this);
            }, {
                once: true
            });
        }, 100);
    }
    resize() {
        if (this.window.classList.contains('window--noDraggable')) {
            this.window.classList.remove('window--noDraggable');
            this.window.classList.add('window');
            this.window.style.position = "relative";
        } else {
            this.position = this.window.getBoundingClientRect();
            this.window.classList.remove('window');
            this.window.classList.add('window--noDraggable');
            this.window.style.position = "absolute";
        }

        var rows = this.displayArea.querySelectorAll('.row');

        var rowsValue = rows.length;
        this.displayArea.innerHTML = null;

        var rowsPerPage = Math.floor(this.displayArea.offsetHeight / 50);
        var pagesValue = Math.ceil(rowsValue / rowsPerPage);
        var j = 0;

        this.pageSelector.innerHTML = null;
        this.pageSelectorCall.style.visibility = "hidden";

        var pagesValArr = [];

        outer: for (let i = 0; i < pagesValue; i++) {
            var page = document.createElement('div');
            page.classList.add('page');

            if (pagesValue > 1) {
                var pageNum = document.createElement('li');
                pageNum.innerHTML = i + 1;
                pageNum.addEventListener('click', function () {
                    var pageIndex = this.innerHTML;
                    console.log(pagesValArr);
                    var pages = this.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.page');
                    for (let i = 0; i < pages.length; i++) {
                        pages[i].style.transform = "translateY(-" + pagesValArr[pageIndex - 1] + "px)";
                    }
                });
                this.pageSelector.append(pageNum);
                this.pageSelectorCall.style.visibility = "visible";

                pagesValArr.push((this.window.querySelector('.window__displayArea').offsetHeight * i));
                console.log(pagesValArr);
            }

            for (j; j < rowsValue; j++) {
                if (page.children.length == rowsPerPage) {
                    continue outer;
                }
                page.append(rows[j]);
                this.displayArea.append(page);
            }
        }
    }
    fill() {
        console.log("filled by default scheme (not filled by default)");
    }
}

class UIwindowItems extends UIwindow {
    constructor(numberOfArea) {
        super(numberOfArea);
        this.name = "Список приборов";
        this.windowName.innerHTML = this.name;
        this.eventsObject = new UIwindowEvents(numberOfArea);

        for (let i = 0; i < 3; i++) {
            let col = document.createElement('p');
            switch (i) {
                case 0:
                    col.innerHTML = "Имя прибора";
                    break;
                case 1:
                    col.innerHTML = "Тип прибора";
                    break;
                case 2:
                    col.innerHTML = "Местоположение";
                    break;
            }
            this.legend.append(col);
        }
        this.fill();
    }
    fill() {
        console.log("filled by Item scheme (filled by items from json file)");
        requestHandler(this, 'appliances.json', this.eventsObject);

        function requestHandler(object, way, eventsObject) {
            var requestURL = way;
            var request = new XMLHttpRequest();

            request.open('GET', requestURL);
            request.responseType = 'json';
            request.send();

            request.addEventListener('load', function () {
                var appliances = request.response;
                var itemsValue = appliances.items.length;
                var rowsPerPage = Math.floor(object.window.querySelector('.window__displayArea').offsetHeight / 50);
                var pagesValue = Math.ceil(itemsValue / rowsPerPage);

                object.pageSelectorCall.style.visibility = "hidden";
                object.pageSelector.innerHTML = null;
                var pagesValArr = [];

                pageCreator(object, itemsValue, rowsPerPage, pagesValue, appliances, eventsObject, pagesValArr);
                var rows = object.window.querySelectorAll('.row');
                for (let k = 0; k < itemsValue; k++) {
                    rows[k].querySelector('.id').innerHTML = appliances.items[k].id;
                    rows[k].querySelector('.name').innerHTML = appliances.items[k].name;
                    rows[k].querySelector('.type').innerHTML = appliances.items[k].type;
                    rows[k].querySelector('.location').innerHTML = appliances.items[k].location;
                }
            });
        }

        function pageCreator(object, itemsValue, rowsPerPage, pagesValue, jsonObj, eventsObject, arrayOfPagesHeights) {
            outer: for (let i = 0; i < pagesValue; i++) {
                var page = document.createElement('div');
                page.classList.add('page');

                if (pagesValue > 1) {
                    var pageNum = document.createElement('li');
                    pageNum.innerHTML = i + 1;
                    pageNum.addEventListener('click', function () {
                        var pageIndex = this.innerHTML;
                        console.log(arrayOfPagesHeights);
                        var pages = this.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.page');
                        for (let i = 0; i < pages.length; i++) {
                            pages[i].style.transform = "translateY(-" + arrayOfPagesHeights[pageIndex - 1] + "px)";
                        }
                    });
                    object.pageSelector.append(pageNum);
                    object.pageSelectorCall.style.visibility = "visible";

                    arrayOfPagesHeights.push((object.window.querySelector('.window__displayArea').offsetHeight * i));
                    console.log(arrayOfPagesHeights);
                }

                for (let j = 0; j < itemsValue; j++) {
                    if (page.children.length == rowsPerPage) {
                        itemsValue = itemsValue - j;
                        j = 0;
                        continue outer;
                    }
                    let row = document.createElement('div');
                    row.classList.add('row');
                    row.addEventListener('click', function () {
                        var id = this.querySelector('.id').innerHTML;
                        for (let i = 0; i < jsonObj.items.length; i++) {
                            if (jsonObj.items[i].id == id) {
                                eventsObject.fill(jsonObj, id);
                            }
                        }
                    });

                    for (let c = 0; c < 4; c++) {
                        let col = document.createElement('p');
                        col.classList.add('row__col');
                        switch (c) {
                            case 0:
                                col.classList.add('id');
                                break;
                            case 1:
                                col.classList.add('name');
                                break;
                            case 2:
                                col.classList.add('type');
                                break;
                            case 3:
                                col.classList.add('location');
                                break;
                        }
                        row.append(col);
                    }
                    page.append(row);
                    object.window.querySelector('.window__displayArea').append(page);
                }
            }
        }
    }
}

class UIwindowEvents extends UIwindow {
    constructor(numberOfArea) {
        super(numberOfArea);
        this.name = "События";
        this.windowName.innerHTML = this.name;

        for (let i = 0; i < 8; i++) {
            let col = document.createElement('p');
            switch (i) {
                case 0:
                    col.innerHTML = "Тип события";
                    break;
                case 1:
                    col.innerHTML = "Время соб.";
                    break;
                case 2:
                    col.innerHTML = "I1 макс,мин";
                    break;
                case 3:
                    col.innerHTML = "I2 макс,мин";
                    break;
                case 4:
                    col.innerHTML = "I3 макс,мин";
                    break;
                case 5:
                    col.innerHTML = "U1 макс,мин";
                    break;
                case 6:
                    col.innerHTML = "U2 макс,мин";
                    break;
                case 7:
                    col.innerHTML = "U3 макс,мин";
                    break;
            }
            this.legend.append(col);
        }
    }
    fill(jsonObj, id) {
        this.displayArea.classList.add('eventsDisplay');
        this.displayArea.innerHTML = null;

        var itemsEventsValue = jsonObj.items[id].events.length;
        var rowsPerPage = Math.floor(this.window.querySelector('.eventsDisplay').offsetHeight / 50);
        var pagesValue = Math.ceil(itemsEventsValue / rowsPerPage);
        this.pageSelector.innerHTML = null;
        this.pageSelectorCall.style.visibility = "hidden";
        var pagesValArr = [];

        outer: for (let i = 0; i < pagesValue; i++) {
            var page = document.createElement('div');
            page.classList.add('page');

            if (pagesValue > 1) {
                var pageNum = document.createElement('li');
                pageNum.innerHTML = i + 1;
                pageNum.addEventListener('click', function () {
                    var pageIndex = this.innerHTML;
                    var pages = this.parentNode.parentNode.parentNode.parentNode.querySelectorAll('.page');
                    for (let i = 0; i < pages.length; i++) {
                        pages[i].style.transform = "translateY(-" + pagesValArr[pageIndex - 1] + "px)";
                    }
                });
                this.pageSelector.append(pageNum);
                this.pageSelectorCall.style.visibility = "visible";

                pagesValArr.push((this.window.querySelector('.window__displayArea').offsetHeight * i));
                console.log(pagesValArr);
                console.log(this.window.querySelector('.window__displayArea').offsetHeight);
            }

            for (let j = 0; j < itemsEventsValue; j++) {
                if (page.children.length == rowsPerPage) {
                    itemsEventsValue = itemsEventsValue - j;
                    j = 0;
                    continue outer;
                }
                let row = document.createElement('div');
                row.classList.add('row');

                for (let c = 0; c < 9; c++) {
                    let col = document.createElement('p');
                    col.classList.add('row__col');
                    switch (c) {
                        case 0:
                            col.classList.add('id');
                            col.innerHTML = jsonObj.items[id].events[j].id;
                            break;
                        case 1:
                            col.classList.add('name');
                            col.innerHTML = jsonObj.items[id].events[j].name;
                            break;
                        case 2:
                            col.classList.add('time');
                            col.innerHTML = jsonObj.items[id].events[j].time;
                            break;
                        case 3:
                            col.classList.add('I1');
                            col.innerHTML = jsonObj.items[id].events[j].I1;
                            break;
                        case 4:
                            col.classList.add('I2');
                            col.innerHTML = jsonObj.items[id].events[j].I2;
                            break;
                        case 5:
                            col.classList.add('I3');
                            col.innerHTML = jsonObj.items[id].events[j].I3;
                            break;
                        case 6:
                            col.classList.add('U1');
                            col.innerHTML = jsonObj.items[id].events[j].U1;
                            break;
                        case 7:
                            col.classList.add('U2');
                            col.innerHTML = jsonObj.items[id].events[j].U2;
                            break;
                        case 8:
                            col.classList.add('U3');
                            col.innerHTML = jsonObj.items[id].events[j].U3;
                            break;
                    }
                    row.append(col);
                }
                page.append(row);
                this.displayArea.append(page);
            }
        }
    }
}

class UIwindowSessions extends UIwindow {
    constructor(numberOfArea) {
        super(numberOfArea);
        this.name = "Сеансы";
        this.windowName.innerHTML = this.name;
    }
}

class UIwindowSettings extends UIwindow {
    constructor(numberOfArea) {
        super(numberOfArea);
        this.name = "Настройки прибора";
        this.windowName.innerHTML = this.name;
    }
}

class UIwindowMap extends UIwindow {
    constructor(numberOfArea) {
        super(numberOfArea);
        this.name = "Карты";
        this.windowName.innerHTML = this.name;
        this.displayArea.innerHTML = `<iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2242.934284606914!2d37.711605316089894!3d55.79437899625188!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x46b5350932de32a7%3A0x56f60255fe36a6bd!2z0J_RgNC10L7QsdGA0LDQttC10L3RgdC60LDRjyDQv9C7LiwgMTIsINCc0L7RgdC60LLQsCwgMTA3MDYx!5e0!3m2!1sru!2sru!4v1572226497199!5m2!1sru!2sru" width="100%" height="100%" frameborder="0" style="border:0;" allowfullscreen=""></iframe>`;
    }
    resize() {
        console.log("here is no resize :p");
        if (this.window.classList.contains('window--noDraggable')) {
            this.window.classList.remove('window--noDraggable');
            this.window.classList.add('window');
            this.window.style.position = "relative";
        } else {
            this.position = this.window.getBoundingClientRect();
            this.window.classList.remove('window');
            this.window.classList.add('window--noDraggable');
            this.window.style.position = "absolute";
        }
    }
}

var itemWin = new UIwindowItems(0);
var sessionsWin = new UIwindowSessions(1);
var settingsWin = new UIwindowSettings(2);
var mapWin = new UIwindowMap(2);


var els = document.querySelectorAll('.workspace__area');
for (let i = 0; i < els.length; i++) {
    var sortable = Sortable.create(els[i], {
        group: "workspace",
        draggable: '.window',
        animation: 150
    });
}