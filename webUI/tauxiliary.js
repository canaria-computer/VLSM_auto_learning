let tabsWithContent = (function () {
    let tabs = document.querySelectorAll('.tabs li');
    let tabsContent = document.querySelectorAll('.tab-content');

    let deactvateAllTabs = function () {
        tabs.forEach(function (tab) {
            tab.classList.remove('is-active');
        });
    };

    let hideTabsContent = function () {
        tabsContent.forEach(function (tabContent) {
            tabContent.classList.remove('is-active');
        });
    };

    let activateTabsContent = function (tab) {
        tabsContent[getIndex(tab)].classList.add('is-active');
    };

    let getIndex = function (el) {
        return [...el.parentElement.children].indexOf(el);
    };

    tabs.forEach(function (tab) {
        tab.addEventListener('click', function () {
            deactvateAllTabs();
            hideTabsContent();
            tab.classList.add('is-active');
            activateTabsContent(tab);
        });
    })

    tabs[0].click();
})();

var tabs = new Tabby('[data-tabs]');
// With a selector
tabs.toggle('#harry');
tabs.setup();

function createTable(tableData, selector, head = []) {
    let table = document.createElement('table');
    table.classList.add("table", "is-bordered", "is-striped", "is-narrow", "is-hoverable", "is-fullwidth")
    let tableBody = document.createElement('tbody');
    let tableThead = document.createElement("thead");
    for (const cellData of head) {
        var cell = document.createElement("td");
        cell.appendChild(document.createTextNode(cellData));
        document.createElement("tr").appendChild(cell);
        tableThead.appendChild(document.createElement("tr").appendChild(cell))
    }
    // data body
    for (const rowData of tableData) {
        let row = document.createElement('tr');
        for (const cellData of rowData) {
            let cell = document.createElement('td');
            cell.appendChild(document.createTextNode(cellData));
            row.appendChild(cell);
        };
        tableBody.appendChild(row);
    }
    table.appendChild(tableThead);
    table.appendChild(tableBody);
    document.querySelector(selector).appendChild(table);
}

function downloadText(fileName, text) {
    const blob = new Blob([text], { type: 'text/html' });
    const aTag = document.createElement('a');
    aTag.href = URL.createObjectURL(blob);
    aTag.target = '_blank';
    aTag.download = fileName;
    aTag.click();
    URL.revokeObjectURL(aTag.href);
}

function zeroPadding(num, len) {
    return (Array(len).join('0') + num).slice(-len);
}

function updateCorrectAnswerRate() {
    document.querySelector("#checkAnswer").classList.remove("is-hidden");// 答えのリンクを表示する
    const correctAnswerRateDisplay = document.getElementById("CorrectAnswerRateDisplay");
    const ratePercent = (~~(document.querySelectorAll("p.help.is-success:not(.is-hidden)").length / document.querySelectorAll("p.help.is-success").length * 10000)) / 100;
    correctAnswerRateDisplay.textContent = `正答率${ratePercent}%`
    const correctAnswerRateDisplayProgressBar = document.getElementById("CorrectAnswerRateDisplayProgressBar");
    correctAnswerRateDisplayProgressBar.value = ratePercent;
    return undefined;
}

function copyTooltipOnClipboard(targetElement) {
    let text = targetElement.getAttribute("data-tooltip");
    targetElement.setAttribute("data-tooltip", "コピーしました")
    setTimeout(() => {
        // 元に戻す
        targetElement.setAttribute("data-tooltip", text)
    }, 1000);
}