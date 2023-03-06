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
 * @returns {number}2のべき乗の指数
 */
Math.getPowerOfTwo = (n) => {
    let power = 0;
    while (Math.pow(2, power) < n) {
        power++;
    }
    return power;
}


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
    return ipv4Address;
}
/**
 * サブネットワークの数をランダムに決定する
 * @param {number} prefix (オリジン)ネットワークのプレフィックス
 * @returns {number}
 */
const subNetworkCountDetermining = (prefix) => {
    let hostBitLength = 32 - prefix;// prefix=24 => 8bit
    return Math.randBetween(2, hostBitLength);
};

// 分割前のネットワークアドレスを生成
// const networkPrefix = Math.randBetween(22, 25); // TODO 本番用
const networkPrefix = 24; // TODO : 本番は削除
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

const sortedSubnetworkRequirementList = subnetworkRequirementList.slice().sort((a, b) => {
    return b.hostCount - a.hostCount;
})

// デバック情報
console.table(
    {
        "networkAddress": ipaddr.IPv4
            .networkAddressFromCIDR(`${networkAddress}/${networkPrefix}`).toString(),
        "Prefix(CIDR)": networkPrefix,
        "subNetworkCount": subNetworkCount,
        // "要件":
    }
);
console.table(subnetworkRequirementList)
console.table(sortedSubnetworkRequirementList)