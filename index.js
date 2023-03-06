const ipaddr = require('ipaddr.js');

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


const determinePrivateIPv4Address = () => {
    const PIPAC = "ABC".split("");// PIPAC = Private IP Address Class
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
    return ipaddr.IPv4.networkAddressFromCIDR(`${ipv4Address}/${networkPrefix}`).toString();
};
/**
 * サブネットワークの数をランダムに決定する
 * @param {number} prefix (オリジン)ネットワークのプレフィックス
 * @returns {number}
 */
const subNetworkCountDetermining = (prefix) => {
    let hostBitLength = 32 - prefix;// prefix=24 => 8bit
    return Math.randBetween(2, hostBitLength);
};

/**
 * サブネットワーク計画に基づいてサブネット化を実行する
 * @param {Array} subNetworkPlan 
 * @returns {object}
 */
const generationAnswer = (subNetworkPlan) => {
    const sortedSubnetworkRequirementList = subNetworkPlan.slice().sort((a, b) => {
        return b.hostCount - a.hostCount;
    });
    // 次の隣接するアドレス
    let nextSubNetAddress = networkAddress;//初期値はネットワークアドレスアドレス
    let count = 0;
    // 繰り返し処理
    for (let i = 0; i < sortedSubnetworkRequirementList.length; i++) {
        const subnetInfo = sortedSubnetworkRequirementList[i]
        sortedSubnetworkRequirementList[i].plefixLength = ipaddr.IPv4.calculatePrefixLength(subnetInfo.hostCount);
        sortedSubnetworkRequirementList[i].addressAndCIDR = `${nextSubNetAddress}/${sortedSubnetworkRequirementList[i].plefixLength}`;// * NW アドレス
        sortedSubnetworkRequirementList[i].subnetMask = ipaddr.IPv4.subnetMaskFromPrefixLength(sortedSubnetworkRequirementList[i].plefixLength).toString();// * サブネットマスク
        sortedSubnetworkRequirementList[i].binarySubnetMask = ipaddr.IPv4.subnetMaskFromPrefixLength(sortedSubnetworkRequirementList[i].plefixLength).toByteArray().map(b => b.toString(2)).join(".");//2進数 サブネットマスク
        sortedSubnetworkRequirementList[i].firstHostAddress = ipaddr.IPv4.getFirstHostAddress(sortedSubnetworkRequirementList[i].addressAndCIDR) + `/${sortedSubnetworkRequirementList[i].plefixLength}`// 最初のホストアドレス
        sortedSubnetworkRequirementList[i].lastHostAddress = ipaddr.IPv4.getLastHostAddress(sortedSubnetworkRequirementList[i].addressAndCIDR) + `/${sortedSubnetworkRequirementList[i].plefixLength}`//最後のホストアドレス
        sortedSubnetworkRequirementList[i].broadcastAddress = ipaddr.IPv4.broadcastAddressFromCIDR(sortedSubnetworkRequirementList[i].addressAndCIDR) + `/${sortedSubnetworkRequirementList[i].plefixLength}`// ブロードキャストアドレス
        sortedSubnetworkRequirementList[i].availableSubnetworkMaxCount = 2 ** (sortedSubnetworkRequirementList[i].plefixLength - networkPrefix);// * このサブネットマスクで作れる最大のサブネットワークの数
        sortedSubnetworkRequirementList[i].switchIPAddress = sortedSubnetworkRequirementList[i].AreSwitcheInSubnetwork ? ipaddr.IPv4.getNextIpAddress(sortedSubnetworkRequirementList[i].broadcastAddress.split("/")[0], -2) : null;//スイッチのアドレス
        nextSubNetAddress = ipaddr.IPv4.getNextIpAddress(sortedSubnetworkRequirementList[i].broadcastAddress.split("/")[0]);// * 次のネットワークのアドレス
    }
    // サブネットマスクの決定
    console.table(sortedSubnetworkRequirementList)
    return sortedSubnetworkRequirementList;
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
// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------
// 分割前のネットワークアドレスを生成
// const networkPrefix = Math.randBetween(22, 25); // TODO 本番用
const networkPrefix = 23; // TODO : 本番は削除
console.info("network(origin) prefix", "Ready");

// プライベートIPアドレスを決定
const networkAddress = ipaddr.IPv4.parse(determinePrivateIPv4Address()); // TODO 本番用
// const networkAddress = ipaddr.parse("192.168.10.0"); //  TODO :本番は削除
console.info("network(origin) address", "Ready");

// サブネットワーク数決定
const subNetworkCount = subNetworkCountDetermining(networkPrefix);
console.info("subnetwork count", "Ready");

// 各サブネットワーク要件を決定
const subnetworkRequirementList = Array.from(new Array(subNetworkCount), (_, i) => {
    let hostCount;
    return {
        subnetName: `サブネット${"ABCDEFGH"[i]}`,// サブネットの名前
        hostCount: (hostCount = Math.randBetween(2,
            (
                2 ** (32 - (
                    networkPrefix + Math.getPowerOfTwo(subNetworkCount)
                ))
            ) - 2
            // 2進数で使えるホストビットを求め、2のべき乗する。ブロードキャストアドレスとネットワークアドレスを除外した数を最大にする
        )), // ホスト数.
        AreSwitcheInSubnetwork: (hostCount >= 3) ? Boolean(Math.round(Math.random())) : false
        // 3台以上の場合のみスイッチが存在するか決定する
    };
});
console.info("subnetwork hostrequirement", "Ready");

// 問題の情報
console.table(subnetworkRequirementList.slice())

// 回答を作成
generationAnswer(subnetworkRequirementList);
