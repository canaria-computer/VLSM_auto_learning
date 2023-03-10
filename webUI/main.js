// const ipaddr = require('ipaddr.js');
/**
 * 指定された範囲の整数を返す
 * @param {number} start 
 * @param {number} end 
 * @returns 
 */
Math.randBetween = (start = 0, end = 1) => {
    return Math.floor((Math.random() * (end - start + 1)) + start);
};
/**
 * 入力値の2のべき乗の指数を求める
 * @param {number} n 入力値
 * @returns {number} 2のべき乗の指数
 * @throws {Error} 整数以外の値が入力された場合にエラーをスローします
 */
Math.getPowerOfTwo = (n) => {
    if (!Number.isInteger(n) || n <= 0) {
        throw new Error("Invalid input: must be a positive integer");
    }
    let power = 0;
    while (Math.pow(2, power) < n) {
        power++;
    }
    return power;
};


// プレフィックス長を求めるプログラムを追加する
/**
 * ホストの台数からプレフィックス長を求める
 * @param {number} hosts ホストの台数
 * @returns プレフィックス長
 */
ipaddr.IPv4.calculatePrefixLength = (hosts) => {
    if (isNaN(hosts) || hosts < 0 || hosts > Math.pow(2, 32) - 2) {
        throw new Error("Invalid input: must be a positive integer less than or equal to " + (Math.pow(2, 32) - 2));
    }
    return 32 - Math.getPowerOfTwo(hosts + 2);
};
/**
* 最初のホストアドレスを求める
* @param {number} IPv4Address_CIDR IPv4アドレスプレフィックス長CIDR表記つき
* @returns {string} 最後の
*/
ipaddr.IPv4.getFirstHostAddress = (IPv4Address_CIDR) => {
    const parsedAddress = ipaddr.IPv4.networkAddressFromCIDR(IPv4Address_CIDR);
    let bytes = parsedAddress.toByteArray();
    bytes[bytes.length - 1] += 1
    return ipaddr.fromByteArray(bytes).toString();
};
/**
* 最後のホストアドレスを求める
* @param {string} IPv4Address IPv4 address string (CIDR付き)
* @param {number} prefixLen prefix Length
* @returns LastHostAddress String
*/
ipaddr.IPv4.getLastHostAddress = (IPv4Address_CIDR) => {
    const parsedAddress = ipaddr.IPv4.broadcastAddressFromCIDR(IPv4Address_CIDR);
    let bytes = parsedAddress.toByteArray();
    bytes[bytes.length - 1] -= 1
    return ipaddr.fromByteArray(bytes).toString();
};
/**
* 指定されたIPv4アドレスの次のアドレスを取得します
* @param {string} ipAddress IPv4アドレスを表す文字列
* @returns {string} 1つ繰り上げたIPv4アドレスを表す文字列
*/
ipaddr.IPv4.getNextIpAddress = (ipAddress, step = 1) => {
    const octets = ipaddr.parse(ipAddress).octets
    let num = 0;
    for (let i = 0; i < octets.length; i++) {
        num += parseInt(octets[i]) * Math.pow(256, 3 - i);
    }//10進数変換
    num += step;
    const result = [];
    for (let i = 0; i < 4; i++) {//文字列化
        result.push(Math.floor(num / Math.pow(256, 3 - i)));
        num = num % Math.pow(256, 3 - i);
    }
    return result.join(".");
};

class SubnetworkConfig {
    constructor() {
        // 分割前のネットワークアドレスを生成
        this.networkPrefix = Math.randBetween(22, 25);
        // プライベートIPアドレスを決定
        this.networkAddress = ipaddr.IPv4.parse(this.determinePrivateIPv4Address());
        // サブネットワーク数決定
        this.subNetworkCount = this.subNetworkCountDetermining(this.networkPrefix);
        this.subnetworkRequirementList = []
        // 各サブネットワーク要件を決定
        this.subnetworkRequirementList = Array.from(new Array(this.subNetworkCount), (_, i) => {
            let hostCount;
            return {
                subnetName: `サブネット${"ABCDEFGHIJKLMLOPQRSTU"[i]}`,// サブネットの名前
                hostCount: (hostCount = Math.randBetween(2,
                    (
                        2 ** (32 - (
                            this.networkPrefix + Math.getPowerOfTwo(this.subNetworkCount)
                        ))
                    ) - 2
                    // 2進数で使えるホストビットを求め、2のべき乗する。ブロードキャストアドレスとネットワークアドレスを除外した数を最大にする
                )), // ホスト数.
                AreSwitcheInSubnetwork: (hostCount >= 3) ? Boolean(Math.round(Math.random())) : false
                // 3台以上の場合のみスイッチが存在するか決定する
            };
        });
    }

    determinePrivateIPv4Address() {
        const PIPAC = ["A", "B", "C"];
        // PIPAC = Private IP Address Class
        let addressClass = Math.randBetween(0, PIPAC.length - 1);
        let ipv4Address = "";
        switch (PIPAC[addressClass]) {
            case "A":
                ipv4Address = `10.${Math.randBetween(0, 255)}.${Math.randBetween(0, 255)}.${Math.randBetween(0, 255)}`
                break;
            case "B":
                ipv4Address = `172.${Math.randBetween(16, 31)}.${Math.randBetween(0, 255)}.${Math.randBetween(0, 255)}`
                break;
            case "C":
                ipv4Address = `192.168.${Math.randBetween(0, 255)}.${Math.randBetween(0, 255)}`
                break;
        }
        return ipaddr.IPv4.networkAddressFromCIDR(`${ipv4Address}/${this.networkPrefix}`).toString();
    };
    /**
     * サブネットワークの数をランダムに決定する
     * @param {number} prefix (オリジン)ネットワークのプレフィックス
     * @returns {number}
     */
    subNetworkCountDetermining(prefix) {
        let hostBitLength = 32 - prefix;
        return Math.randBetween(2, hostBitLength);
    };

    /**
     * サブネットワーク計画に基づいてサブネット化を実行する
     * @param {Array} subNetworkPlan 
     * @returns {object}
     */
    generationAnswer(subNetworkPlan) {
        const sortedSubnetworkRequirementList = subNetworkPlan.slice().sort((a, b) => {
            return b.hostCount - a.hostCount;
        });
        // 次の隣接するアドレス
        let nextSubNetAddress = this.networkAddress;//初期値はネットワークアドレスアドレス
        // 繰り返し処理
        for (let i = 0; i < sortedSubnetworkRequirementList.length; i++) {
            const subnetInfo = sortedSubnetworkRequirementList[i]
            sortedSubnetworkRequirementList[i].plefixLength = ipaddr.IPv4.calculatePrefixLength(subnetInfo.hostCount);
            sortedSubnetworkRequirementList[i].addressAndCIDR = `${nextSubNetAddress}/${sortedSubnetworkRequirementList[i].plefixLength}`;// * NW アドレス
            sortedSubnetworkRequirementList[i].subnetMask = ipaddr.IPv4.subnetMaskFromPrefixLength(sortedSubnetworkRequirementList[i].plefixLength).toString();// * サブネットマスク
            sortedSubnetworkRequirementList[i].binarySubnetMask = ipaddr.IPv4.subnetMaskFromPrefixLength(sortedSubnetworkRequirementList[i].plefixLength).toByteArray().map(b => b.toString(2)).map(d => zeroPadding(d, 8)).join(".");//2進数 サブネットマスク
            sortedSubnetworkRequirementList[i].firstHostAddress = ipaddr.IPv4.getFirstHostAddress(sortedSubnetworkRequirementList[i].addressAndCIDR) + `/${sortedSubnetworkRequirementList[i].plefixLength}`// 最初のホストアドレス
            sortedSubnetworkRequirementList[i].lastHostAddress = ipaddr.IPv4.getLastHostAddress(sortedSubnetworkRequirementList[i].addressAndCIDR) + `/${sortedSubnetworkRequirementList[i].plefixLength}`//最後のホストアドレス
            sortedSubnetworkRequirementList[i].broadcastAddress = ipaddr.IPv4.broadcastAddressFromCIDR(sortedSubnetworkRequirementList[i].addressAndCIDR) + `/${sortedSubnetworkRequirementList[i].plefixLength}`// ブロードキャストアドレス
            sortedSubnetworkRequirementList[i].availableSubnetworkMaxCount = 2 ** (sortedSubnetworkRequirementList[i].plefixLength - this.networkPrefix);// * このサブネットマスクで作れる最大のサブネットワークの数
            sortedSubnetworkRequirementList[i].maxHostCount = 2 ** (32 - sortedSubnetworkRequirementList[i].plefixLength) - 2
            sortedSubnetworkRequirementList[i].switchIPAddress = sortedSubnetworkRequirementList[i].AreSwitcheInSubnetwork ? ipaddr.IPv4.getNextIpAddress(sortedSubnetworkRequirementList[i].broadcastAddress.split("/")[0], -2) : null;//スイッチのアドレス
            nextSubNetAddress = ipaddr.IPv4.getNextIpAddress(sortedSubnetworkRequirementList[i].broadcastAddress.split("/")[0]);// * 次のネットワークのアドレス
        }
        // サブネットマスクの決定
        return sortedSubnetworkRequirementList;
    };
    createMarkdown() {
        let head = "# VLSM Skill Base Assesment 対策\n\n"
        head += "自動的に生成した問題を解いて対策しよう!\n"
        head += "\n---\n"
        let quiz = "## 問題\n\n";
        quiz += `IPアドレスとサブネットマスクが**${this.networkAddress.toString()}/${this.networkPrefix}**のネットワークを下の表に従いサブネット化してください。\n`
        quiz += "|  サブネットワーク名  |  ホストの数  |\n";
        quiz += "| ---- | ---- |\n";

        let answer = "## 模範回答\n\n"
        for (const item of this.subnetworkRequirementList) {
            quiz += `| ${item.subnetName} | ${item.hostCount} |\n`
            /*
            subnetName    "サブネットA"
            plefixLength        24
            binarySubnetMask        "11111111.11111111.11111111.0"
            subnetMask    "255.255.255.0"
            availableSubnetworkMaxCount  4
            maxHostCount        254
            addressAndCIDR          "192.168.245.0/24"
            firstHostAddress        "192.168.245.1/24"
            lastHostAddress         "192.168.245.254/24"
            broadcastAddress        "192.168.245.255/24"
            AreSwitcheInSubnetwork    false
            switchIPAddress  null
            hostCount      145
            */
            answer += `### ${item.subnetName}\n\n`
            answer += `#### 計算\n\n`
            answer += "| 仕様 | 回答 |\n"
            answer += "| --- | --- |\n"
            answer += `|プレフィックス長|${item.plefixLength}|\n`
            answer += `|2進数サブネットマスク|${item.binarySubnetMask}|\n`
            answer += `|サブネットマスク|${item.subnetMask}|\n`
            answer += `|使用可能最大サブネットワーク数|${item.availableSubnetworkMaxCount}|\n`
            answer += `|最大ホスト数|${item.maxHostCount}|\n`
            answer += `|サブネットワークアドレス|${item.addressAndCIDR}|\n`
            answer += `|最初のホストIPアドレス|${item.firstHostAddress}|\n`
            answer += `|最後のホストIPアドレス|${item.lastHostAddress}|\n`
            answer += `|ブロードキャストアドレス|${item.broadcastAddress}|\n`
            answer += "\n"
            answer += "#### アドレッシングテーブル\n"
            answer += "\n"
            answer += "| デバイス | IPアドレス| サブネットマスク | デフォルトゲートウェイ |\n"
            answer += "| ------- | --------- | -------------- | -------------------- |\n"
            answer += `| ホストコンピュータ | ${item.firstHostAddress.split("/")[0]} |${item.subnetMask}| ${item.lastHostAddress.split("/")[0]} |\n`
            answer += `| ルータインターフェース | ${item.lastHostAddress.split("/")[0]} | ${item.subnetMask} | 該当なし |\n`
            answer += item.AreSwitcheInSubnetwork ? `| スイッチ仮想インターフェース | ${item.switchIPAddress.split("/")[0]} | ${item.subnetMask} | 該当なし |\n` : ""
            answer += "\n"
        }
        return [head, quiz, answer].join("\n");
    }
}
let quiz = new SubnetworkConfig();
// 問題の情報
// console.table(quiz.subnetworkRequirementList);
// 回答を作成
createTable(quiz.subnetworkRequirementList.map(i => [i.subnetName, i.hostCount]), "#Requirement", ["サブネットワーク名", "ホストの台数"]);
createTable(quiz.generationAnswer(quiz.subnetworkRequirementList)
    .map(i => [i.subnetName, i.hostCount, i.availableSubnetworkMaxCount, i.binarySubnetMask, i.subnetMask, i.maxHostCount, i.addressAndCIDR, i.firstHostAddress, i.lastHostAddress, i.broadcastAddress]), "#AnswerTable",
    ["サブネットワーク名", "ホストの台数", "サブネットの最大数", "2進数サブネットマスク", "サブネットマスク", "最大ホスト数", "サブネットワークアドレス", "最初のホストIPアドレス", "最後のホストIPアドレス", "ダイレクトブロードキャストアドレス"]);
document.getElementById("originIpAddressAndCIDR").textContent = `${quiz.networkAddress.toString()}/${quiz.networkPrefix}`
// -----------------------------------------------------
// md作成
const markdown = quiz.createMarkdown();
// 変換器設定
const converter = new showdown.Converter();
converter.setOption('tables', true);
// html生成
const html = converter.makeHtml(markdown);
const downloadHtml = `<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Document</title>
    <link rel="stylesheet" href="https://fonts.xz.style/serve/inter.css">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@exampledev/new.css@1.1.2/new.min.css">
</head>

<body>
    ${html}
</body>

</html>`
document.getElementById("DownloadButton").addEventListener("click", () => downloadText(`${new Date().toISOString()}_VLSM Skill Base Assesment.html`, downloadHtml), false);

// ----------------------

document.getElementById("showQuiz").addEventListener("click", () => {
    const quizTab = document.getElementById("Quiz");
    const showQuizButton = document.getElementById("showQuiz")
    if (quizTab.getAttribute("hidden") === null) {
        quizTab.setAttribute("hidden", "hidden");
        showQuizButton.textContent = "問題を表示";
    } else {
        quizTab.removeAttribute("hidden");
        showQuizButton.textContent = "問題を非表示";
    }
}, false)
for (let element of document.querySelectorAll("div.tabs > ul > *:not(li:nth-child(1))")) {
    const quizTab = document.getElementById("Quiz");
    const showQuizButton = document.getElementById("showQuiz")
    element.addEventListener("click", () => {
        quizTab.setAttribute("hidden", "hidden");
        showQuizButton.textContent = "問題を表示";
    }, true);
}

for (let item of quiz.subnetworkRequirementList) {
    const subnetName = item.subnetName;
    const hostCount = item.hostCount;
    const availableSubnetworkMaxCount = item.availableSubnetworkMaxCount;
    const binarySubnetMask = item.binarySubnetMask;
    const subnetMask = item.subnetMask;
    const maxHostCount = item.maxHostCount;
    const addressAndCIDR = item.addressAndCIDR;
    const firstHostAddress = item.firstHostAddress;
    const lastHostAddress = item.lastHostAddress;
    const broadcastAddress = item.broadcastAddress;
    // "サブネットワーク名", "ホストの台数", "サブネットの最大数", "2進数サブネットマスク", "サブネットマスク", "最大ホスト数", "サブネットワークアドレス", "最初のホストIPアドレス", "最後のホストIPアドレス", "ダイレクトブロードキャストアドレス"
    const quizFormFieldTemplate = document.getElementById("quizFormField");
    const content = quizFormFieldTemplate.content;
    const clone = document.importNode(content, true);
    // 答え設定
    clone.getElementById("subnetName").innerText = subnetName;
    clone.getElementById("subnetName").removeAttribute("id");
    clone.getElementById("hostCountField").innerText = hostCount;
    clone.getElementById("hostCountField").removeAttribute("id");
    let prefixLengthAnswer = clone.querySelector('[checkeType="prefixLength"]');
    prefixLengthAnswer.setAttribute("answer", ipaddr.IPv4.parse(subnetMask).prefixLengthFromSubnetMask());
    let binarySubnetmaskAnswer = clone.querySelector('[checkeType="binarySubnetmask"]');
    binarySubnetmaskAnswer.setAttribute("answer", binarySubnetMask);
    let subnetmaskAnswer = clone.querySelector('[checkeType="subnetmask"]');
    subnetmaskAnswer.setAttribute("answer", subnetMask);
    let maxHostCountAnswer = clone.querySelector('[checkType="maxHostCount"]');
    maxHostCountAnswer.setAttribute("answer", maxHostCount);
    let availableSubnetworkMaxCountAnswer = clone.querySelector('[checkeType="availableSubnetworkMaxCount"]');
    availableSubnetworkMaxCountAnswer.setAttribute("answer", availableSubnetworkMaxCount);
    let addressAndCIDRAnswer = clone.querySelector('[checkeType="addressAndCIDR"]');
    addressAndCIDRAnswer.setAttribute("answer", addressAndCIDR);
    let firstHostAddressAnswer = clone.querySelector('[checkeType="firstHostAddress"]');
    firstHostAddressAnswer.setAttribute("answer", firstHostAddress);
    let lastHostAddressAnswer = clone.querySelector('[checkeType="lastHostAddress"]');
    lastHostAddressAnswer.setAttribute("answer", lastHostAddress);
    let broadcastAddressAnswer = clone.querySelector('[checkeType="broadcastAddress"]');
    broadcastAddressAnswer.setAttribute("answer", broadcastAddress);
    function simpleCheck(event) {
        if (event.target.getAttribute("answer") === event.target.value) {
            changeResult("correct", event.target)
        } else {
            changeResult("incorrect", event.target)
        }
    }
    function changeResult(result, baseElement) {
        switch (result) {
            case "correct":
                baseElement.parentElement.querySelector("p.help.is-success").classList.remove("is-hidden");
                baseElement.parentElement.querySelector("p.help.is-warning").classList.add("is-hidden");
                baseElement.classList.remove("is-warning", "is-warning", "has-background-warning");
                baseElement.classList.add("is-success", "has-background-success", "has-text-white");
                break;
            case "incorrect":
                baseElement.parentElement.querySelector("p.help.is-success").classList.add("is-hidden");
                baseElement.parentElement.querySelector("p.help.is-warning").classList.remove("is-hidden");
                baseElement.classList.add("is-warning", "has-background-warning");
                baseElement.classList.remove("is-success", "has-background-success", "has-text-white");
                break;
            default: break;
        }
    }
    // イベント処理
    prefixLengthAnswer.addEventListener("change", simpleCheck, false);
    binarySubnetmaskAnswer.addEventListener("change", (event) => {
        let answer = event.target.value
        let binaryOctet = answer.split(/\.| /g);
        if (1 <= binaryOctet.length < 4) {
            answer = binaryOctet.join("");
        }
        event.target.value = (binaryOctet = answer.match(/\d{8}/g)).join(".");
        simpleCheck(event);
    }, false);
    subnetmaskAnswer.addEventListener("change", (event) => {
        // レアアドレスフォーマットをスタンダードフォーマットに変換する
        if (!(ipaddr.isValid(event.target.value) || ipaddr.isValid(event.target.value.split("/")[0]))) {// IPアドレスが有効か判定する
            changeResult("incorrect", event.target)
            return;
        }
        if (event.target.value !== ipaddr.IPv4.parse(event.target.value)) {
            event.target.value = ipaddr.IPv4.parse(event.target.value)
        }
        simpleCheck(event);
    }, false);
    maxHostCountAnswer.addEventListener("change", simpleCheck, false);
    availableSubnetworkMaxCountAnswer.addEventListener("change", simpleCheck, false);
    addressAndCIDRAnswer.addEventListener("change", (event) => {
        if (!(ipaddr.isValid(event.target.value) || ipaddr.isValid(event.target.value.split("/")[0]))) {// IPアドレスが有効か判定する
            changeResult("incorrect", event.target)
            return;
        }
        const answerAddressAndSIDR = event.target.getAttribute("answer");
        const [answerAddress, _] = ipaddr.IPv4.parseCIDR(answerAddressAndSIDR);
        if (event.target.value.indexOf("/") === -1) {//プレフィックス長を含まないとき
            event.target.value = ipaddr.IPv4.parse(event.target.value).toString();
            if (event.target.value === answerAddress.toString()) {
                changeResult("correct", event.target);
                if (prefixLengthAnswer.parentElement.querySelector("p.help.is-success").classList.contains("is-hidden") === false) {
                    event.target.value = event.target.getAttribute("answer");
                }
            } else {
                changeResult("incorrect", event.target);
            }
        } else {
            event.target.value = ipaddr.IPv4.parseCIDR(event.target.value).toString();
            if (answerAddressAndSIDR === ipaddr.IPv4.parseCIDR(event.target.value).toString()) {
                changeResult("correct", event.target);
            } else {
                changeResult("incorrect", event.target);
            }
        }
    }, false);
    firstHostAddressAnswer.addEventListener("change", (event) => {
        if (!(ipaddr.isValid(event.target.value) || ipaddr.isValid(event.target.value.split("/")[0]))) {// IPアドレスが有効か判定する
            changeResult("incorrect", event.target)
            return;
        }
        const answerAddressAndSIDR = event.target.getAttribute("answer");
        const [answerAddress, _] = ipaddr.IPv4.parseCIDR(answerAddressAndSIDR);
        if (event.target.value.indexOf("/") === -1) {//プレフィックス長を含まないとき
            event.target.value = ipaddr.IPv4.parse(event.target.value).toString();
            if (event.target.value === answerAddress.toString()) {
                changeResult("correct", event.target);
                if (prefixLengthAnswer.parentElement.querySelector("p.help.is-success").classList.contains("is-hidden") === false) {
                    event.target.value = event.target.getAttribute("answer");
                }
            } else {
                changeResult("incorrect", event.target);
            }
        } else {
            event.target.value = ipaddr.IPv4.parseCIDR(event.target.value).toString();
            if (answerAddressAndSIDR === ipaddr.IPv4.parseCIDR(event.target.value).toString()) {
                changeResult("correct", event.target);
            } else {
                changeResult("incorrect", event.target);
            }
        }
    }, false);
    lastHostAddressAnswer.addEventListener("change", (event) => {
        if (!(ipaddr.isValid(event.target.value) || ipaddr.isValid(event.target.value.split("/")[0]))) {// IPアドレスが有効か判定する
            changeResult("incorrect", event.target)
            return;
        }
        const answerAddressAndSIDR = event.target.getAttribute("answer");
        const [answerAddress, _] = ipaddr.IPv4.parseCIDR(answerAddressAndSIDR);
        if (event.target.value.indexOf("/") === -1) {//プレフィックス長を含まないとき
            event.target.value = ipaddr.IPv4.parse(event.target.value).toString();
            if (event.target.value === answerAddress.toString()) {
                changeResult("correct", event.target);
                if (prefixLengthAnswer.parentElement.querySelector("p.help.is-success").classList.contains("is-hidden") === false) {
                    event.target.value = event.target.getAttribute("answer");
                }
            } else {
                changeResult("incorrect", event.target);
            }
        } else {
            event.target.value = ipaddr.IPv4.parseCIDR(event.target.value).toString();
            if (answerAddressAndSIDR === ipaddr.IPv4.parseCIDR(event.target.value).toString()) {
                changeResult("correct", event.target);
            } else {
                changeResult("incorrect", event.target);
            }
        }
    }, false);
    broadcastAddressAnswer.addEventListener("change", (event) => {
        if (!(ipaddr.isValid(event.target.value) || ipaddr.isValid(event.target.value.split("/")[0]))) {// IPアドレスが有効か判定する
            changeResult("incorrect", event.target)
            return;
        }
        const answerAddressAndSIDR = event.target.getAttribute("answer");
        const [answerAddress, _] = ipaddr.IPv4.parseCIDR(answerAddressAndSIDR);
        if (event.target.value.indexOf("/") === -1) {//プレフィックス長を含まないとき
            event.target.value = ipaddr.IPv4.parse(event.target.value).toString();
            if (event.target.value === answerAddress.toString()) {
                changeResult("correct", event.target);
                if (prefixLengthAnswer.parentElement.querySelector("p.help.is-success").classList.contains("is-hidden") === false) {
                    event.target.value = event.target.getAttribute("answer");
                }
            } else {
                changeResult("incorrect", event.target);
            }
        } else {
            event.target.value = ipaddr.IPv4.parseCIDR(event.target.value).toString();
            if (answerAddressAndSIDR === ipaddr.IPv4.parseCIDR(event.target.value).toString()) {
                changeResult("correct", event.target);
            } else {
                changeResult("incorrect", event.target);
            }
        }
    }, false);
    // ---
    for (let elementListItem of [
        prefixLengthAnswer, binarySubnetmaskAnswer, subnetmaskAnswer,
        maxHostCountAnswer, availableSubnetworkMaxCountAnswer, addressAndCIDRAnswer,
        firstHostAddressAnswer, lastHostAddressAnswer, broadcastAddressAnswer
    ]) {
        elementListItem.addEventListener("change", updateCorrectAnswerRate, false);
    }
    quizFormFieldTemplate.before(clone);
}

