'use strict';

//--------_skills_---------

function SkillData(name, level, icon) {
    this.name = name;
    this.level = level;
    this.iconName = icon;
}

function GetComparer(prop) {
    return function (a, b) {
        if (a[prop] < b[prop]) {
            return -1;
        }

        if (a[prop] > b[prop]) {
            return 1;
        }
        return 0;
    }
}

const skills = {
    data: [],

    sortMode: null,
    lastUrl: null,
    
    init: function(skillList, sortBtns, warnMsg){
        this.skillList = skillList;
        this.sortBtns = sortBtns;
        this.warnMsg = warnMsg;
        this.warnMsg.querySelector(".button-common").addEventListener('click', () => { this.getData(this.lastUrl); });
    },

    getData: function(url) {
        this.lastUrl = url;
        fetch(url)
            .then(data => {
                if (!data.ok) throw new Error(`HTTP error ${data.status}`);
                return data.json();
            })
            .then(object => {
                this.data = object;
                this.clearErrorState();
                this.generateList();
            })
            .catch(error => this.handleError(error));
    },

    handleError: function (err) {
        console.error('Ошибка получения данных навыков:', err);

        // убираем предыдущие сообщения об ошибке, если есть
        this.clearErrorState();

        this.warnMsg.classList.remove('visually-hidden');

        // отключаем отображение кнопок сортировки
        this.sortBtns.classList.add('visually-hidden');
    },

    clearErrorState: function () {
        // выключаем отображение окна с предупреждением
        this.warnMsg.classList.add('visually-hidden');

        // включаем отображение кнопок сортировки
        this.sortBtns.classList.remove('visually-hidden');
    },

    generateList: function () {
        this.skillList.innerHTML = '';
        this.data.forEach(item => {
            const dd = document.createElement('dd');
            const dt = document.createElement('dt');
            const div = document.createElement('div');

            dt.classList.add('skill-item');
            dd.classList.add('skill-level');

            dt.innerText = item.name;
            dt.style.backgroundImage = `url('./img/skills/${item.iconName}')`;

            div.style.width = item.level + '%';

            dd.append(div);

            this.skillList.append(dt, dd);
        });
    },

    sortByProp: function (prop) {
        if (this.sortMode != prop) {
            this.sortMode = prop;
            this.data.sort(GetComparer(prop));
        }
        else {
            this.data.reverse();
        }

        this.generateList();
    }
}

const skillList = document.querySelector('.skill-list');
const sortBtns = document.querySelector('.container-skills-header-btns');
const warnMsg = document.querySelector(".skills-error-wrapper");

skills.init(skillList, sortBtns, warnMsg);
skills.getData('db/skills.json');

const sortBtnsBlock = document.querySelector('.container-skills-header-btns');

sortBtnsBlock.addEventListener('click', (e) => {
    const target = e.target;

    if (target.nodeName != 'BUTTON')
        return;

    switch (target.dataset.type) {
        case 'name':
        case 'level':
            skills.sortByProp(target.dataset.type);
            break;

        default:
            console.error('Неизвестная кнопка');
            break;
    }
});

//--------_menu_---------

const menu = {
    nav: document.querySelector('.main-nav'),
    navBtn: document.querySelector('.nav-btn'),

    close: function () {
        this.nav.classList.add('main-nav_closed');

        this.navBtn.classList.remove('nav-btn_close');
        this.navBtn.classList.add('nav-btn_open');

        this.navBtn.children[0].innerText = 'Открыть меню';
    },

    open: function () {
        this.nav.classList.remove('main-nav_closed');

        this.navBtn.classList.remove('nav-btn_open');
        this.navBtn.classList.add('nav-btn_close');

        this.navBtn.children[0].innerText = 'Закрыть меню';
    }
};

menu.navBtn.addEventListener('click', (e) => {
    if (e.target.classList.contains('nav-btn_open')) {
        menu.open();
    } else {
        menu.close();
    }
});

menu.close();

//--------_theme-switcher_---------

const themeSwitcher = {
    init: function (checkboxSelector, darkClass, storageKey) {
        this.checkboxSelector = checkboxSelector;
        this.darkClass = darkClass;
        this.storageKey = storageKey;

        this.checkbox = document.querySelector(this.checkboxSelector);
        if (!this.checkbox) return;

        const stored = localStorage.getItem(this.storageKey);
        let isChecked;
        switch (true) {
            case (stored === "1"):
                isChecked = true;
                break;
            
            case (stored === "0"):
                isChecked = false;
                break;
        
            default:
                isChecked = this.checkbox.checked;
                break;
        }
        this.checkbox.checked = isChecked;
        this.changeBodyThemeClass(isChecked);

        this.checkbox.addEventListener('change', this.onChange.bind(this));
    },

    onChange: function (e) {
        const checked = e.target.checked;
        this.changeBodyThemeClass(checked);
        try {
            localStorage.setItem(this.storageKey, checked ? 1 : 0);
        } catch (err) {
            // localStorage может быть недоступен в некоторых окружениях — игнорируем
        }
    },

    changeBodyThemeClass: function (isLightTheme) {
        if (isLightTheme) {
            document.body.classList.remove(this.darkClass);
        } else {
            document.body.classList.add(this.darkClass);
        }
    },
};

themeSwitcher.init('.switch-checkbox', 'dark-theme', 'lightThemeOn');