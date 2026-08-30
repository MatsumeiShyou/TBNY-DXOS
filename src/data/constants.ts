// ==========================================
// データ定義 (マスタ & モック)
// ==========================================

// カラーパレット定義 (18色)
export const COLOR_PALETTE = [
  { name: 'Red',     bg: 'bg-red-100',     border: 'border-red-300',     text: 'text-red-900' },
  { name: 'Orange',  bg: 'bg-orange-100',  border: 'border-orange-300',  text: 'text-orange-900' },
  { name: 'Amber',   bg: 'bg-amber-100',   border: 'border-amber-300',   text: 'text-amber-900' },
  { name: 'Yellow',  bg: 'bg-yellow-100',  border: 'border-yellow-300',  text: 'text-yellow-900' },
  { name: 'Lime',    bg: 'bg-lime-100',    border: 'border-lime-300',    text: 'text-lime-900' },
  { name: 'Green',   bg: 'bg-green-100',   border: 'border-green-300',   text: 'text-green-900' },
  { name: 'Emerald', bg: 'bg-emerald-100', border: 'border-emerald-300', text: 'text-emerald-900' },
  { name: 'Teal',    bg: 'bg-teal-100',    border: 'border-teal-300',    text: 'text-teal-900' },
  { name: 'Cyan',    bg: 'bg-cyan-100',    border: 'border-cyan-300',    text: 'text-cyan-900' },
  { name: 'Sky',     bg: 'bg-sky-100',     border: 'border-sky-300',     text: 'text-sky-900' },
  { name: 'Blue',    bg: 'bg-blue-100',    border: 'border-blue-300',    text: 'text-blue-900' },
  { name: 'Indigo',  bg: 'bg-indigo-100',  border: 'border-indigo-300',  text: 'text-indigo-900' },
  { name: 'Violet',  bg: 'bg-violet-100',  border: 'border-violet-300',  text: 'text-violet-900' },
  { name: 'Purple',  bg: 'bg-purple-100',  border: 'border-purple-300',  text: 'text-purple-900' },
  { name: 'Fuchsia', bg: 'bg-fuchsia-100', border: 'border-fuchsia-300', text: 'text-fuchsia-900' },
  { name: 'Pink',    bg: 'bg-pink-100',    border: 'border-pink-300',    text: 'text-pink-900' },
  { name: 'Rose',    bg: 'bg-rose-100',    border: 'border-rose-300',    text: 'text-rose-900' },
  { name: 'Slate',   bg: 'bg-slate-100',   border: 'border-slate-300',   text: 'text-slate-900' },
];

export const MASTER_DRIVERS_LIST = ['畑澤', '菊地', '万里', '片山', '大貴', '鈴木', '佐藤', '田中'];
export const MASTER_VEHICLES_LIST = ['2025PK', '2267PK', '2618PK', '5122PK', '1111PK', '西濃運輸', '予備車', 'レンタカー'];
export const MASTER_ITEMS_LIST = [
  { name: '段ﾎﾞｰﾙ', kana: 'だんぼーる' },
  { name: '臭付段', kana: 'においつきだん' },
  { name: '雑がみ', kana: 'ざつがみ' },
  { name: '雑誌', kana: 'ざっし' },
  { name: '雑故紙', kana: 'ざつこし' },
  { name: 'ﾍﾟｯﾄ', kana: 'ぺっと' },
  { name: '廃ﾌﾟﾗ軟質', kana: 'はいぷらなんしつ' },
  { name: 'ｽﾄﾚｯﾁ', kana: 'すとれっち' },
  { name: 'ﾋﾞﾆｰﾙﾊﾞﾗ', kana: 'びにーるばら' },
  { name: 'ﾐｯｸｽ紙', kana: 'みっくすし' },
  { name: '紙管', kana: 'しかん' },
  { name: '上ｹﾝﾄ', kana: 'じょうけんと' },
  { name: 'ｼｭﾚｯﾀﾞ', kana: 'しゅれっだ' },
  { name: '雑袋', kana: 'ざつぶくろ' },
  { name: 'R巻取', kana: 'あーるまきとり' },
  { name: '模造ﾊﾞﾗ', kana: 'もぞうばら' },
  { name: 'ﾏﾙﾁﾊﾟｯｸ･ﾊﾞﾗ', kana: 'まるちぱっくばら' },
  { name: 'ｱﾙﾐ缶', kana: 'あるみかん' },
  { name: '機密書類', kana: 'きみつしょるい' },
  { name: 'PPﾊﾞﾝﾄﾞ', kana: 'ぴーぴーばんど' },
  { name: '新聞', kana: 'しんぶん' },
  { name: '雑誌/ｼｭﾚｯﾀﾞ', kana: 'ざっし/しゅれっだ' }
];


// 初期マスターデータ（workersマスタ）
export const INITIAL_WORKERS = [
  { id: 'w_hatazawa', name: '畑澤', kana: 'はたざわ', license_types: ['普通', '中型', '大型'], is_active: true },
  { id: 'w_kikuchi', name: '菊地', kana: 'きくち', license_types: ['普通', '中型'], is_active: true },
  { id: 'w_banri', name: '万里', kana: 'ばんり', license_types: ['普通', '中型'], is_active: true },
  { id: 'w_katayama', name: '片山', kana: 'かたやま', license_types: ['普通', '中型', '大型'], is_active: true },
  { id: 'w_daiki', name: '大貴', kana: 'だいき', license_types: ['普通'], is_active: true },
  { id: 'w_suzuki', name: '鈴木', kana: 'すずき', license_types: ['普通', '中型'], is_active: true },
  { id: 'w_sato', name: '佐藤', kana: 'さとう', license_types: ['普通'], is_active: true },
  { id: 'w_tanaka', name: '田中', kana: 'たなか', license_types: ['普通', '中型'], is_active: true },
];


// 初期マスターデータ（vehiclesマスタ）
export const INITIAL_VEHICLES = [
  { id: 'v_2025pk', name: '2025PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_2267pk', name: '2267PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_2618pk', name: '2618PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_5122pk', name: '5122PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_1111pk', name: '1111PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'v_seino', name: '西濃運輸', vehicle_type: 'flat_4t', max_capacity_kg: 4000 },
  { id: 'v_spare', name: '予備車', vehicle_type: 'other', max_capacity_kg: null },
  { id: 'v_rental', name: 'レンタカー', vehicle_type: 'rental', max_capacity_kg: null },
];


export const INITIAL_ITEMS = MASTER_ITEMS_LIST.map((item, i) => ({
  id: `item_init_${i}`,
  name: item.name,
  kana: item.kana,
  requiredVehicle: '',
  estimatedDuration: 0
}));



export const CUSTOMERS = [
  {
    "id": "c_1036000",
    "supplierCode": "1036000",
    "supplierName": "㈱セフティ",
    "payeeCode": "1036000",
    "payeeName": "㈱セフティ",
    "name": "㈱セフティ",
    "kana": "ｾﾌﾃｨ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1075001",
    "supplierCode": "1075001",
    "supplierName": "㈱一全(ダイコー商事)",
    "payeeCode": "1075000",
    "payeeName": "㈲ダイコー商事",
    "name": "㈱一全(ダイコー商事)",
    "kana": "ｲﾁｾﾞﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [
        "every"
      ],
      "tue": [
        "every"
      ],
      "wed": [
        "every"
      ],
      "thu": [
        "every"
      ],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1124000",
    "supplierCode": "1124000",
    "supplierName": "高山 藤沢センター",
    "payeeCode": "1124000",
    "payeeName": "高山 藤沢センター",
    "name": "高山 藤沢センター",
    "kana": "ﾀｶﾔﾏ ﾌｼﾞｻﾜｾﾝﾀｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "4143"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1124100",
    "supplierCode": "1124100",
    "supplierName": "㈱高山　東名支店大和ｾﾝﾀｰ",
    "payeeCode": "1124100",
    "payeeName": "㈱高山　東名支店大和ｾﾝﾀｰ",
    "name": "㈱高山　東名支店大和ｾﾝﾀｰ",
    "kana": "ﾀｶﾔﾏ ﾄｳﾒｲｼﾃﾝﾔﾏﾄｾﾝﾀｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "4128",
      "4143",
      "1200"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1130000",
    "supplierCode": "1130000",
    "supplierName": "タキゲン製造㈱厚木支店",
    "payeeCode": "1130000",
    "payeeName": "タキゲン製造㈱厚木支店",
    "name": "タキゲン製造㈱厚木支店",
    "kana": "ﾀｷｹﾞﾝｾｲｿﾞｳ ｱﾂｷﾞｼﾃﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1161003",
    "supplierCode": "1161003",
    "supplierName": "ＥＳＰＯＴ（ﾎﾟｲﾝﾄ）(田丸)",
    "payeeCode": "1161000",
    "payeeName": "㈱田丸",
    "name": "ＥＳＰＯＴ（ﾎﾟｲﾝﾄ）(田丸)",
    "kana": "ｴｽﾎﾟｯﾄ ﾎﾟｲﾝﾄ ﾀﾏﾙ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4114",
      "1970",
      "4314"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1161004",
    "supplierCode": "1161004",
    "supplierName": "ＥＳＰＯＴ（ﾊﾞｯｸﾔｰﾄﾞ）(田丸)",
    "payeeCode": "1161000",
    "payeeName": "㈱田丸",
    "name": "ＥＳＰＯＴ（ﾊﾞｯｸﾔｰﾄﾞ）(田丸)",
    "kana": "ｴｽﾎﾟｯﾄ ﾊﾞｯｸﾔｰﾄﾞ ﾀﾏﾙ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1203001",
    "supplierCode": "1203001",
    "supplierName": "オートバックス座間店(ﾃｨｰｴｽ)",
    "payeeCode": "1203000",
    "payeeName": "ティーエスエンバイロ㈱",
    "name": "オートバックス座間店(ﾃｨｰｴｽ)",
    "kana": "ｵｰﾄﾊﾞｯｸｽｻﾞﾏﾃﾝ ﾃｨｰｴｽ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1204000",
    "supplierCode": "1204000",
    "supplierName": "ＴＳ環境リサイクル㈱",
    "payeeCode": "1204000",
    "payeeName": "ＴＳ環境リサイクル㈱",
    "name": "ＴＳ環境リサイクル㈱",
    "kana": "ﾃｨｰｴｽｶﾝｷｮｳﾘｻｲｸﾙ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205023",
    "supplierCode": "1205023",
    "supplierName": "カンナミアクアシステム(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "カンナミアクアシステム(ＤＳＰ)",
    "kana": "ｶﾝﾅﾐｱｸｱｼｽﾃﾑ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205027",
    "supplierCode": "1205027",
    "supplierName": "クリナップ南関東テクノ(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "クリナップ南関東テクノ(ＤＳＰ)",
    "kana": "ｸﾘﾅｯﾌﾟﾐﾅﾐｶﾝﾄｳﾃｸﾉ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205030",
    "supplierCode": "1205030",
    "supplierName": "鴻池運輸㈱(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "鴻池運輸㈱(ＤＳＰ)",
    "kana": "ｺｳﾉｲｹｳﾝﾕ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [
        "every"
      ],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205031",
    "supplierCode": "1205031",
    "supplierName": "広陽(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "広陽(ＤＳＰ)",
    "kana": "ｺｳﾖｳ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [
        "2"
      ],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": "第２月曜日"
  },
  {
    "id": "c_1205034",
    "supplierCode": "1205034",
    "supplierName": "小山㈱(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "小山㈱(ＤＳＰ)",
    "kana": "ｺﾔﾏ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205052",
    "supplierCode": "1205052",
    "supplierName": "東京研文社(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "東京研文社(ＤＳＰ)",
    "kana": "ﾄｳｷｮｳｹﾝﾌﾞﾝｼｬ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1612"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205057",
    "supplierCode": "1205057",
    "supplierName": "西多摩運送㈱(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "西多摩運送㈱(ＤＳＰ)",
    "kana": "ﾆｼﾀﾏｳﾝﾕ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [
        "every"
      ],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205065",
    "supplierCode": "1205065",
    "supplierName": "ピアノ運送厚木共配(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "ピアノ運送厚木共配(ＤＳＰ)",
    "kana": "ﾋﾟｱﾉｳﾝｿｳｱﾂｷﾞｷｮｳﾊｲ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205069",
    "supplierCode": "1205069",
    "supplierName": "㈱ブリヂストン横浜工場(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱ブリヂストン横浜工場(ＤＳＰ)",
    "kana": "ﾌﾞﾘﾁﾞｽﾄﾝﾖｺﾊﾏｺｳｼﾞｮｳ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205075",
    "supplierCode": "1205075",
    "supplierName": "本間ゴルフ藤沢店(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "本間ゴルフ藤沢店(ＤＳＰ)",
    "kana": "ﾎﾝﾏｺﾞﾙﾌﾌｼﾞｻﾜﾃﾝ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205084",
    "supplierCode": "1205084",
    "supplierName": "有隣堂(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "有隣堂(ＤＳＰ)",
    "kana": "ﾕｳﾘﾝﾄﾞｳ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [
        "every"
      ],
      "wed": [],
      "thu": [],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205093",
    "supplierCode": "1205093",
    "supplierName": "ﾕﾆﾏｯﾄﾗｲﾌ厚木営業所(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "ﾕﾆﾏｯﾄﾗｲﾌ厚木営業所(ＤＳＰ)",
    "kana": "ﾕﾆﾏｯﾄﾗｲﾌｱﾂｷﾞｴｲｷﾞｮｳｼｮ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205097",
    "supplierCode": "1205097",
    "supplierName": "ﾕﾆﾏｯﾄﾚﾝﾀﾙ厚木(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "ﾕﾆﾏｯﾄﾚﾝﾀﾙ厚木(ＤＳＰ)",
    "kana": "ﾕﾆﾏｯﾄﾚﾝﾀﾙｱﾂｷﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205098",
    "supplierCode": "1205098",
    "supplierName": "ユニマットレンタル藤沢(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "ユニマットレンタル藤沢(ＤＳＰ)",
    "kana": "ﾕﾆﾏｯﾄﾚﾝﾀﾙﾌｼﾞｻﾜ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205110",
    "supplierCode": "1205110",
    "supplierName": "㈱エディスタ（ＤＳＰ）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱エディスタ（ＤＳＰ）",
    "kana": "ｴﾃﾞｨｽﾀ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4128",
      "4143",
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205114",
    "supplierCode": "1205114",
    "supplierName": "陸上自衛隊久里浜駐屯地(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "陸上自衛隊久里浜駐屯地(ＤＳＰ)",
    "kana": "ｼﾞｴｲﾀｲｸﾘﾊﾏﾁｭｳﾄﾝﾁ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [
        "4"
      ],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1603"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": "第２,第４水曜日,他"
  },
  {
    "id": "c_1205115",
    "supplierCode": "1205115",
    "supplierName": "小山㈱戸塚事業所",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "小山㈱戸塚事業所",
    "kana": "ｺﾔﾏﾄﾂｶ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [
        "every"
      ],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205125",
    "supplierCode": "1205125",
    "supplierName": "㈲ﾀﾞﾌﾞｻｰﾌｨﾝｸﾞｳｪｯﾄｽｰﾂ（ＤＳＰ）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈲ﾀﾞﾌﾞｻｰﾌｨﾝｸﾞｳｪｯﾄｽｰﾂ（ＤＳＰ）",
    "kana": "ﾀﾞﾌﾞｻｰﾌｨﾝｸﾞｳｪｯﾄｽｰﾂ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [
        "every"
      ],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205129",
    "supplierCode": "1205129",
    "supplierName": "㈱武部鉄工所（ＤＳＰ）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱武部鉄工所（ＤＳＰ）",
    "kana": "ﾀｹﾍﾞﾃｯｺｳｼｮ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [
        "every"
      ],
      "wed": [],
      "thu": [],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205136",
    "supplierCode": "1205136",
    "supplierName": "㈱ﾘﾊﾞｰｸﾚｲﾝ（ＤＳＰ）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱ﾘﾊﾞｰｸﾚｲﾝ（ＤＳＰ）",
    "kana": "ﾘﾊﾞｰｸﾚｲﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [
        "every"
      ],
      "tue": [
        "every"
      ],
      "wed": [
        "every"
      ],
      "thu": [
        "every"
      ],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1100",
      "1000",
      "1200"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205142",
    "supplierCode": "1205142",
    "supplierName": "相模原･多摩PF（ＤＳＰ）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "相模原･多摩PF（ＤＳＰ）",
    "kana": "ﾀﾏﾋﾟｰｴﾌ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [
        "every"
      ],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205146",
    "supplierCode": "1205146",
    "supplierName": "㈱E.F.C",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱E.F.C",
    "kana": "ｲｰｴﾌｼｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [
        "every"
      ],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": "自衛隊のない水曜日"
  },
  {
    "id": "c_1205151",
    "supplierCode": "1205151",
    "supplierName": "㈱マルナカ（ＤＳＰ）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱マルナカ（ＤＳＰ）",
    "kana": "ﾏﾙﾅｶ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205152",
    "supplierCode": "1205152",
    "supplierName": "英海商事㈱（DSP）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "英海商事㈱（DSP）",
    "kana": "ｴｲｶｲｼｮｳｼﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [
        "every"
      ],
      "tue": [],
      "wed": [
        "every"
      ],
      "thu": [],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1205156",
    "supplierCode": "1205156",
    "supplierName": "㈱ﾘﾗｲｽﾞ（DSP）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱ﾘﾗｲｽﾞ（DSP）",
    "kana": "ﾘﾗｲｽﾞ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205177",
    "supplierCode": "1205177",
    "supplierName": "ｹｲﾌﾞﾗﾝﾄﾞ㈱（DSP）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "ｹｲﾌﾞﾗﾝﾄﾞ㈱（DSP）",
    "kana": "ｹｲﾌﾞﾗﾝﾄﾞ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1205182",
    "supplierCode": "1205182",
    "supplierName": "㈱厚木ﾐｸﾛ（DSP）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱厚木ﾐｸﾛ（DSP）",
    "kana": "ｱﾂｷﾞﾐｸﾛ ﾃﾞｨｰｴｽﾋﾟｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1253000",
    "supplierCode": "1253000",
    "supplierName": "東京ロジファクトリー㈱",
    "payeeCode": "1253000",
    "payeeName": "東京ロジファクトリー㈱",
    "name": "東京ロジファクトリー㈱",
    "kana": "ﾄｳｷｮｳﾛｼﾞﾌｧｸﾄﾘｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1352007",
    "supplierCode": "1352007",
    "supplierName": "東京冷機厚木(ナカダイ)",
    "payeeCode": "1352000",
    "payeeName": "㈱ナカダイ",
    "name": "東京冷機厚木(ナカダイ)",
    "kana": "ﾄｳﾚｲ ｱﾂｷﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [
        "4"
      ],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": "第２,第４火曜日"
  },
  {
    "id": "c_1352011",
    "supplierCode": "1352011",
    "supplierName": "東京冷機神奈川ＳＳ(ナカダイ)",
    "payeeCode": "1352000",
    "payeeName": "㈱ナカダイ",
    "name": "東京冷機神奈川ＳＳ(ナカダイ)",
    "kana": "ﾄｳﾚｲ ｻｶﾞﾐﾊﾗ ｶﾅｶﾞﾜ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [
        "every"
      ],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1352017",
    "supplierCode": "1352017",
    "supplierName": "東京冷機湘南(ナカダイ)",
    "payeeCode": "1352000",
    "payeeName": "㈱ナカダイ",
    "name": "東京冷機湘南(ナカダイ)",
    "kana": "ﾄｳﾚｲ ｼｮｳﾅﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [
        "every"
      ],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1533000",
    "supplierCode": "1533000",
    "supplierName": "㈱春うららかな書房",
    "payeeCode": "1533000",
    "payeeName": "㈱春うららかな書房",
    "name": "㈱春うららかな書房",
    "kana": "ﾊﾙｳﾗﾗｶ",
    "area": "",
    "address": "",
    "jobType": "spot",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1535002",
    "supplierCode": "1535002",
    "supplierName": "パルシステム相模青果センター",
    "payeeCode": "1535000",
    "payeeName": "㈱パルシステム電力",
    "name": "パルシステム相模青果センター",
    "kana": "ﾊﾟﾙｼｽﾃﾑｻｶﾞﾐｾｲｶｾﾝﾀｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1998"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1535003",
    "supplierCode": "1535003",
    "supplierName": "パルシステム相模センター",
    "payeeCode": "1535000",
    "payeeName": "㈱パルシステム電力",
    "name": "パルシステム相模センター",
    "kana": "ﾊﾟﾙｼｽﾃﾑｻｶﾞﾐｾﾝﾀｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1998"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1556000",
    "supplierCode": "1556000",
    "supplierName": "東日本協同パレット㈱",
    "payeeCode": "1556000",
    "payeeName": "東日本協同パレット㈱",
    "name": "東日本協同パレット㈱",
    "kana": "ﾋｶﾞｼﾆﾎﾝｷｮｳﾄﾞｳﾊﾟﾚｯﾄ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1709031",
    "supplierCode": "1709031",
    "supplierName": "ﾁｸﾌﾞP上依知事業所(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "ﾁｸﾌﾞP上依知事業所(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "kana": "ﾁｸﾌﾞﾋﾟｰｶﾐｴﾁｼﾞｷﾞｮｳｼｮ ﾎﾟｼﾞﾃｨﾌﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1003",
      "4128",
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1709032",
    "supplierCode": "1709032",
    "supplierName": "ﾁｸﾌﾞP上溝事業所(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "ﾁｸﾌﾞP上溝事業所(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "kana": "ﾁｸﾌﾞﾋﾟｰｶﾐﾐｿﾞｼﾞｷﾞｮｳｼｮ ﾎﾟｼﾞﾃｨﾌﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1971",
      "1003",
      "4128"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1709043",
    "supplierCode": "1709043",
    "supplierName": "富士ロジ厚木金田(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "富士ロジ厚木金田(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "kana": "ﾌｼﾞﾛｼﾞｱﾂｷﾞｶﾈﾀﾞ ﾎﾟｼﾞﾃｨﾌﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1971"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1709053",
    "supplierCode": "1709053",
    "supplierName": "富士ロジ東名厚木(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "富士ロジ東名厚木(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "kana": "ﾌｼﾞﾛｼﾞﾄｳﾒｲｱﾂｷﾞ ﾎﾟｼﾞﾃｨﾌﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1971",
      "4128"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1709054",
    "supplierCode": "1709054",
    "supplierName": "富士ロジ長沼/神奈川(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "富士ロジ長沼/神奈川(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "kana": "ﾌｼﾞﾛｼﾞﾅｶﾞﾇﾏｶﾅｶﾞﾜ ﾎﾟｼﾞﾃｨﾌﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1971",
      "4128"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1709064",
    "supplierCode": "1709064",
    "supplierName": "富士ロジ横浜町田(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "富士ロジ横浜町田(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "kana": "ﾌｼﾞﾛｼﾞﾖｺﾊﾏﾏﾁﾀﾞ ﾎﾟｼﾞﾃｨﾌﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1971",
      "4128"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1709068",
    "supplierCode": "1709068",
    "supplierName": "三井倉庫ﾛｼﾞｽﾃｨｸｽ㈱(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "三井倉庫ﾛｼﾞｽﾃｨｸｽ㈱(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "kana": "ﾐﾂｲｿｳｺ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [
        "every"
      ],
      "wed": [],
      "thu": [
        "every"
      ],
      "fri": [],
      "sat": [
        "every"
      ],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4128",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1709087",
    "supplierCode": "1709087",
    "supplierName": "富士ﾛｼﾞ厚木三田第二ﾛｼﾞ(ﾎﾟｼﾞﾃ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "富士ﾛｼﾞ厚木三田第二ﾛｼﾞ(ﾎﾟｼﾞﾃ)",
    "kana": "ﾌｼﾞﾛｼﾞｱﾂｷﾞｻﾝﾀﾞﾀﾞｲﾆﾛｼﾞ ﾎﾟｼﾞﾃ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "4128",
      "1971"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1784000",
    "supplierCode": "1784000",
    "supplierName": "丸駒運輸㈱",
    "payeeCode": "1784000",
    "payeeName": "丸駒運輸㈱",
    "name": "丸駒運輸㈱",
    "kana": "ﾏﾙｺﾏ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [
        "every"
      ],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "4103",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_1801607",
    "supplierCode": "1801607",
    "supplierName": "㈱不二家平塚工場（丸紅FR）",
    "payeeCode": "1801600",
    "payeeName": "丸紅ﾌｫﾚｽﾄﾘﾝｸｽ㈱",
    "name": "㈱不二家平塚工場（丸紅FR）",
    "kana": "ﾌｼﾞﾔﾋﾗﾂｶｺｳｼﾞｮｳ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [
        "every"
      ],
      "tue": [
        "every"
      ],
      "wed": [
        "every"
      ],
      "thu": [
        "every"
      ],
      "fri": [
        "every"
      ],
      "sat": [
        "every"
      ],
      "sun": []
    },
    "holidayCollection": true,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1971",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": "不二家ｶﾚﾝﾀﾞｰ参照"
  },
  {
    "id": "c_1946000",
    "supplierCode": "1946000",
    "supplierName": "㈱山崎歯車製作所",
    "payeeCode": "1946000",
    "payeeName": "㈱山崎歯車製作所",
    "name": "㈱山崎歯車製作所",
    "kana": "ﾔﾏｻﾞｷﾊｸﾞﾙﾏｾｲｻｸｼｮ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1971",
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_1975000",
    "supplierCode": "1975000",
    "supplierName": "㈱裕源",
    "payeeCode": "1975000",
    "payeeName": "㈱裕源",
    "name": "㈱裕源",
    "kana": "ﾕｳｹﾞﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [
        "every"
      ],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_2042000",
    "supplierCode": "2042000",
    "supplierName": "㈱ロジスティクス・ネットワーク",
    "payeeCode": "2042000",
    "payeeName": "㈱ロジスティクス・ネットワーク",
    "name": "㈱ロジスティクス・ネットワーク",
    "kana": "ﾛｼﾞｽﾃｨｸｽﾈｯﾄﾜｰｸ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_2095000",
    "supplierCode": "2095000",
    "supplierName": "㈱上神谷運送厚木",
    "payeeCode": "2095000",
    "payeeName": "㈱上神谷運送厚木",
    "name": "㈱上神谷運送厚木",
    "kana": "ﾆﾜﾀﾞﾆｳﾝｿｳｱﾂｷﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4128",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_2539000",
    "supplierCode": "2539000",
    "supplierName": "小泉機器工業㈱厚木営業所",
    "payeeCode": "2539000",
    "payeeName": "小泉機器工業㈱厚木営業所",
    "name": "小泉機器工業㈱厚木営業所",
    "kana": "ｺｲｽﾞﾐｷｷｺｳｷﾞｮｳ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_2554000",
    "supplierCode": "2554000",
    "supplierName": "㈱横浜DeNAﾍﾞｲｽﾀｰｽﾞ",
    "payeeCode": "2554000",
    "payeeName": "㈱横浜DeNAﾍﾞｲｽﾀｰｽﾞ",
    "name": "㈱横浜DeNAﾍﾞｲｽﾀｰｽﾞ",
    "kana": "ﾃﾞｨｰｴﾇｴｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [
        "every"
      ],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_2569000",
    "supplierCode": "2569000",
    "supplierName": "日本加工機材㈱",
    "payeeCode": "2569000",
    "payeeName": "日本加工機材㈱",
    "name": "日本加工機材㈱",
    "kana": "ﾆﾎﾝｶｺｳｷｻﾞｲ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1954"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_2734000",
    "supplierCode": "2734000",
    "supplierName": "㈱ｱｸﾃｨｵ EG横浜営業所",
    "payeeCode": "2734000",
    "payeeName": "㈱ｱｸﾃｨｵ EG横浜営業所",
    "name": "㈱ｱｸﾃｨｵ EG横浜営業所",
    "kana": "ｱｸﾃｨｵ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [
        "1"
      ],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": "第１月曜日"
  },
  {
    "id": "c_2772000",
    "supplierCode": "2772000",
    "supplierName": "湘南寝台社",
    "payeeCode": "2772000",
    "payeeName": "湘南寝台社",
    "name": "湘南寝台社",
    "kana": "ｼｮｳﾅﾝｼﾝﾀﾞｲｼｬ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_3021000",
    "supplierCode": "3021000",
    "supplierName": "トナミ運輸㈱相模支店",
    "payeeCode": "3021000",
    "payeeName": "トナミ運輸㈱相模支店",
    "name": "トナミ運輸㈱相模支店",
    "kana": "ﾄﾅﾐｳﾝﾕｻｶﾞﾐｼﾃﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_3146000",
    "supplierCode": "3146000",
    "supplierName": "㈱ディーミング",
    "payeeCode": "3146000",
    "payeeName": "㈱ディーミング",
    "name": "㈱ディーミング",
    "kana": "ﾃﾞｨｰﾐﾝｸﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_3168001",
    "supplierCode": "3168001",
    "supplierName": "小田急電鉄㈱（都市環境ｻｰﾋﾞｽ）",
    "payeeCode": "3168000",
    "payeeName": "都市環境ｻｰﾋﾞｽ㈱",
    "name": "小田急電鉄㈱（都市環境ｻｰﾋﾞｽ）",
    "kana": "ｵﾀﾞｷｭｳﾃﾞﾝﾃﾂ ﾄｼｶﾝｷｮｳｻｰﾋﾞｽ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1970",
      "1625"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0384098",
    "supplierCode": "0384098",
    "supplierName": "ｳｴﾙｼｱ平塚中原店（大本）",
    "payeeCode": "0384000",
    "payeeName": "大本紙料㈱",
    "name": "ｳｴﾙｼｱ平塚中原店（大本）",
    "kana": "ｳｴﾙｼｱﾋﾗﾂｶﾅｶﾊﾗﾃﾝ ｵｵﾓﾄ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0557006",
    "supplierCode": "0557006",
    "supplierName": "㈱ｽﾄﾘｯｸｽｺﾝｻﾙﾃｨﾝｸﾞ(共栄商社)",
    "payeeCode": "0557000",
    "payeeName": "㈱共栄商社",
    "name": "㈱ｽﾄﾘｯｸｽｺﾝｻﾙﾃｨﾝｸﾞ(共栄商社)",
    "kana": "ｽﾄﾘｯｸｽｺﾝｻﾙﾃｨﾝｸﾞ ｷｮｳｴｲｼｮｳｼｬ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0384112",
    "supplierCode": "0384112",
    "supplierName": "資さんうどん倉見店（大本）",
    "payeeCode": "0384000",
    "payeeName": "大本紙料㈱",
    "name": "資さんうどん倉見店（大本）",
    "kana": "ｽｹｻﾝｳﾄﾞﾝｸﾗﾐﾃﾝ ｵｵﾓﾄ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0383273",
    "supplierCode": "0383273",
    "supplierName": "SBSﾌﾚｯｸ㈱厚木低温DC（大本）",
    "payeeCode": "0383000",
    "payeeName": "大本紙料㈱",
    "name": "SBSﾌﾚｯｸ㈱厚木低温DC（大本）",
    "kana": "ｴｽﾋﾞｰｴｽﾌﾚｯｸｱﾂｷﾞﾃｲｵﾝﾃﾞｨｰｼｰ ｵｵﾓﾄ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4143",
      "1000",
      "1200",
      "4128"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0383090",
    "supplierCode": "0383090",
    "supplierName": "ｸﾘｴｲﾄSD相模原当麻店(大本)",
    "payeeCode": "0383000",
    "payeeName": "大本紙料㈱",
    "name": "ｸﾘｴｲﾄSD相模原当麻店(大本)",
    "kana": "ｸﾘｴｲﾄｴｽﾃﾞｨｰｻｶﾞﾐﾊﾗﾀｲﾏﾃﾝ ｵｵﾓﾄ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0002000",
    "supplierCode": "0002000",
    "supplierName": "㈱アークル海老名営業所",
    "payeeCode": "0002000",
    "payeeName": "㈱アークル海老名営業所",
    "name": "㈱アークル海老名営業所",
    "kana": "ｱｰｸﾙｴﾋﾞﾅｴｲｷﾞｮｳｼｮ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0774062",
    "supplierCode": "0774062",
    "supplierName": "早稲田アカデミー本厚木校(SFI)",
    "payeeCode": "0774000",
    "payeeName": "㈱サティスファクトリー",
    "name": "早稲田アカデミー本厚木校(SFI)",
    "kana": "ﾜｾﾀﾞｱｶﾃﾞﾐｰﾎﾝｱﾂｷﾞｺｳ ｴｽｴﾌｱｲ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0083051",
    "supplierCode": "0083051",
    "supplierName": "伊藤ﾋﾞﾙ（神奈中商事）",
    "payeeCode": "0083050",
    "payeeName": "㈱神奈中商事",
    "name": "伊藤ﾋﾞﾙ（神奈中商事）",
    "kana": "ｲﾄｳﾋﾞﾙ ｶﾅﾁｭｳｼｮｳｼﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1100",
      "1200",
      "1625"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0024000",
    "supplierCode": "0024000",
    "supplierName": "㈱ＩＷＤ",
    "payeeCode": "0024000",
    "payeeName": "㈱ＩＷＤ",
    "name": "㈱ＩＷＤ",
    "kana": "ｱｲﾀﾞﾌﾞﾘｭｰﾃﾞｨｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0621002",
    "supplierCode": "0621002",
    "supplierName": "ﾀｷﾛﾝｼｰｱｲ㈱(ｸﾘｰﾝｻｰﾋﾞｽ)",
    "payeeCode": "0621000",
    "payeeName": "㈱クリーンサービス",
    "name": "ﾀｷﾛﾝｼｰｱｲ㈱(ｸﾘｰﾝｻｰﾋﾞｽ)",
    "kana": "ﾀｷﾛﾝｼｰｱｲ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [
        "every"
      ],
      "wed": [],
      "thu": [
        "every"
      ],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_0383251",
    "supplierCode": "0383251",
    "supplierName": "大創産業 神奈川RDC（大本）",
    "payeeCode": "0383000",
    "payeeName": "大本紙料㈱",
    "name": "大創産業 神奈川RDC（大本）",
    "kana": "ﾀﾞｲｿｳｻﾝｷﾞｮｳｶﾅｶﾞﾜｱｰﾙﾃﾞｨｰｼｰ ｵｵﾓﾄ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4143",
      "4128"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0135000",
    "supplierCode": "0135000",
    "supplierName": "イシダ製作所",
    "payeeCode": "0135000",
    "payeeName": "イシダ製作所",
    "name": "イシダ製作所",
    "kana": "ｲｼﾀﾞｾｲｻｸｼｮ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0050000",
    "supplierCode": "0050000",
    "supplierName": "㈱旭運送",
    "payeeCode": "0050000",
    "payeeName": "㈱旭運送",
    "name": "㈱旭運送",
    "kana": "ｱｻﾋｳﾝｿｳ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [
        "every"
      ],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_0033001",
    "supplierCode": "0033001",
    "supplierName": "富士電線(アオイ)",
    "payeeCode": "0033000",
    "payeeName": "㈱アオイ",
    "name": "富士電線(アオイ)",
    "kana": "ﾌｼﾞﾃﾞﾝｾﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1998",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_0863000",
    "supplierCode": "0863000",
    "supplierName": "敷島製パン㈱",
    "payeeCode": "0863000",
    "payeeName": "敷島製パン㈱",
    "name": "敷島製パン㈱",
    "kana": "ｼｷｼﾏｾｲﾊﾟﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1968"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0621001",
    "supplierCode": "0621001",
    "supplierName": "ｵｰﾄﾊﾞｯｸｽ伊勢原店(ｸﾘｰﾝｻｰﾋﾞｽ)",
    "payeeCode": "0621000",
    "payeeName": "㈱クリーンサービス",
    "name": "ｵｰﾄﾊﾞｯｸｽ伊勢原店(ｸﾘｰﾝｻｰﾋﾞｽ)",
    "kana": "ｵｰﾄﾊﾞｯｸｽｲｾﾊﾗ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [
        "every"
      ],
      "sun": []
    },
    "holidayCollection": true,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_0774073",
    "supplierCode": "0774073",
    "supplierName": "㈱ﾛｼﾞｽﾃｨｸｽﾈｯﾄﾜｰｸ（ｻﾃｨｽﾌｧｸﾄﾘｰ）",
    "payeeCode": "0774000",
    "payeeName": "㈱サティスファクトリー",
    "name": "㈱ﾛｼﾞｽﾃｨｸｽﾈｯﾄﾜｰｸ（ｻﾃｨｽﾌｧｸﾄﾘｰ）",
    "kana": "ﾛｼﾞｽﾃｨｸｽﾈｯﾄﾜｰｸ ｻﾃｨｽﾌｧｸﾄﾘｰ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4128"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0903000",
    "supplierCode": "0903000",
    "supplierName": "ｼﾞｬｸｿﾝ･ﾗﾎﾞﾗﾄﾘｰ･ｼﾞｬﾊﾟﾝ㈱",
    "payeeCode": "0903000",
    "payeeName": "ｼﾞｬｸｿﾝ･ﾗﾎﾞﾗﾄﾘｰ･ｼﾞｬﾊﾟﾝ㈱",
    "name": "ｼﾞｬｸｿﾝ･ﾗﾎﾞﾗﾄﾘｰ･ｼﾞｬﾊﾟﾝ㈱",
    "kana": "ｼﾞｬｸｿﾝ･ﾗﾎﾞﾗﾄﾘｰ･ｼﾞｬﾊﾟﾝ",
    "area": "",
    "address": "",
    "jobType": "spot",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [
        "every"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1968",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": ""
  },
  {
    "id": "c_0000027",
    "supplierCode": "0000027",
    "supplierName": "ゑびす興運　有限会社",
    "payeeCode": "0000027",
    "payeeName": "諸口(厚木)",
    "name": "ゑびす興運　有限会社",
    "kana": "ｴﾋﾞｽｺｳｳﾝ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[Excel未紐付] ",
    "isInvalid": false
  },
  {
    "id": "c_0239000",
    "supplierCode": "0239000",
    "supplierName": "宇都宮螺子㈱",
    "payeeCode": "0239000",
    "payeeName": "宇都宮螺子㈱",
    "name": "宇都宮螺子㈱",
    "kana": "ｳﾂﾉﾐﾔﾚｼﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [
        "3"
      ],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "1000"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": "第３木曜日"
  },
  {
    "id": "c_0774060",
    "supplierCode": "0774060",
    "supplierName": "㈱LIXIL厚木営業所(SFI)",
    "payeeCode": "0774000",
    "payeeName": "㈱サティスファクトリー",
    "name": "㈱LIXIL厚木営業所(SFI)",
    "kana": "ﾘｸｼﾙｱﾂｷﾞ",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [
        "3"
      ],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[Excel連携済] ",
    "isInvalid": false,
    "customSchedule": "第３金曜日"
  }
,
  {
    "id": "c_1968000",
    "supplierCode": "1968000",
    "supplierName": "ﾕｱｻﾌﾅｼｮｸ㈱厚木物流ｾﾝﾀｰ",
    "payeeCode": "1968000",
    "payeeName": "ﾕｱｻﾌﾅｼｮｸ㈱厚木物流ｾﾝﾀｰ",
    "name": "ﾕｱｻﾌﾅｼｮｸ㈱厚木物流ｾﾝﾀｰ",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0383153",
    "supplierCode": "0383153",
    "supplierName": "ｸﾘｴｲﾄSD平塚中原店(大本)",
    "payeeCode": "0383000",
    "payeeName": "大本紙料㈱",
    "name": "ｸﾘｴｲﾄSD平塚中原店(大本)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0383154",
    "supplierCode": "0383154",
    "supplierName": "ｸﾘｴｲﾄSD平塚長持店(大本)",
    "payeeCode": "0383000",
    "payeeName": "大本紙料㈱",
    "name": "ｸﾘｴｲﾄSD平塚長持店(大本)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1551001",
    "supplierCode": "1551001",
    "supplierName": "ビギ(ビートレーディング)",
    "payeeCode": "1551000",
    "payeeName": "㈱ビートレーディング",
    "name": "ビギ(ビートレーディング)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0621003",
    "supplierCode": "0621003",
    "supplierName": "㈱ｻｰﾄﾞｳｪｰﾌﾞ（ｸﾘｰﾝｻｰﾋﾞｽ）",
    "payeeCode": "0621000",
    "payeeName": "㈱クリーンサービス",
    "name": "㈱ｻｰﾄﾞｳｪｰﾌﾞ（ｸﾘｰﾝｻｰﾋﾞｽ）",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0384055",
    "supplierCode": "0384055",
    "supplierName": "ウエルシア相模原田名店(大本)",
    "payeeCode": "0384000",
    "payeeName": "大本紙料㈱",
    "name": "ウエルシア相模原田名店(大本)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1709041",
    "supplierCode": "1709041",
    "supplierName": "ハートロジスティクス(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "ハートロジスティクス(ﾎﾟｼﾞﾃｨﾌﾞ)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_2085003",
    "supplierCode": "2085003",
    "supplierName": "大和ハウス工業㈱伊勢原現場",
    "payeeCode": "2085000",
    "payeeName": "大和ハウス工業㈱",
    "name": "大和ハウス工業㈱伊勢原現場",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0000027",
    "supplierCode": "0000027",
    "supplierName": "都市環境サービス（株）",
    "payeeCode": "0000027",
    "payeeName": "諸口(厚木)",
    "name": "都市環境サービス（株）",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1984"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1426000",
    "supplierCode": "1426000",
    "supplierName": "日本紙パルプ商事㈱（1）",
    "payeeCode": "1426000",
    "payeeName": "日本紙パルプ商事㈱（1）",
    "name": "日本紙パルプ商事㈱（1）",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4098"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_2537000",
    "supplierCode": "2537000",
    "supplierName": "厚木市環境センター",
    "payeeCode": "2537000",
    "payeeName": "厚木市環境センター",
    "name": "厚木市環境センター",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1625",
      "1000",
      "1970"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1772000",
    "supplierCode": "1772000",
    "supplierName": "㈱マルイチ",
    "payeeCode": "1772000",
    "payeeName": "㈱マルイチ",
    "name": "㈱マルイチ",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1038002",
    "supplierCode": "1038002",
    "supplierName": "デジタルプロセス(JSE-NET)",
    "payeeCode": "1038000",
    "payeeName": "ＪＳＲ－ＮＥＴ",
    "name": "デジタルプロセス(JSE-NET)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1205007",
    "supplierCode": "1205007",
    "supplierName": "㈱エバネクスト(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "㈱エバネクスト(ＤＳＰ)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1603"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0523000",
    "supplierCode": "0523000",
    "supplierName": "関包スチール㈱",
    "payeeCode": "0523000",
    "payeeName": "関包スチール㈱",
    "name": "関包スチール㈱",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1603"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_2085004",
    "supplierCode": "2085004",
    "supplierName": "大和ハウス工業㈱綾瀬現場",
    "payeeCode": "2085004",
    "payeeName": "大和ハウス工業㈱綾瀬現場",
    "name": "大和ハウス工業㈱綾瀬現場",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_2706000",
    "supplierCode": "2706000",
    "supplierName": "HUMAN MADE㈱",
    "payeeCode": "2706000",
    "payeeName": "HUMAN MADE㈱",
    "name": "HUMAN MADE㈱",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1968"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1950000",
    "supplierCode": "1950000",
    "supplierName": "㈱山櫻八王子の森工場",
    "payeeCode": "1950000",
    "payeeName": "㈱山櫻八王子の森工場",
    "name": "㈱山櫻八王子の森工場",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1705"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0024001",
    "supplierCode": "0024001",
    "supplierName": "㈱ｵﾉｺﾑ（ＩＷＤ）",
    "payeeCode": "0024000",
    "payeeName": "㈱ＩＷＤ",
    "name": "㈱ｵﾉｺﾑ（ＩＷＤ）",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1024001",
    "supplierCode": "1024001",
    "supplierName": "㈱セイミツ平塚工場",
    "payeeCode": "1024000",
    "payeeName": "㈱セイミツ",
    "name": "㈱セイミツ平塚工場",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1205053",
    "supplierCode": "1205053",
    "supplierName": "東京スチールセンター(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "東京スチールセンター(ＤＳＰ)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "1200"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1205163",
    "supplierCode": "1205163",
    "supplierName": "関東ｾｲﾜ（DSP）",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "関東ｾｲﾜ（DSP）",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1709000",
    "supplierCode": "1709000",
    "supplierName": "(合)ポジティブ",
    "payeeCode": "1709000",
    "payeeName": "(合)ポジティブ",
    "name": "(合)ポジティブ",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_3051000",
    "supplierCode": "3051000",
    "supplierName": "ＭＦ物流㈱",
    "payeeCode": "3051000",
    "payeeName": "ＭＦ物流㈱",
    "name": "ＭＦ物流㈱",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1205060",
    "supplierCode": "1205060",
    "supplierName": "ハーゼスト(ＤＳＰ)",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "ハーゼスト(ＤＳＰ)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1610"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0630058",
    "supplierCode": "0630058",
    "supplierName": "近代ｾｰﾙｽ社（ＧＬＴ）",
    "payeeCode": "0630000",
    "payeeName": "グリーンロジテック㈱",
    "name": "近代ｾｰﾙｽ社（ＧＬＴ）",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200",
      "4109"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_2145001",
    "supplierCode": "2145001",
    "supplierName": "東京ｱﾙﾌｧﾗｲﾝ相模原",
    "payeeCode": "2145000",
    "payeeName": "㈱東京アルファライン",
    "name": "東京ｱﾙﾌｧﾗｲﾝ相模原",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_2145000",
    "supplierCode": "2145000",
    "supplierName": "㈱東京アルファライン",
    "payeeCode": "2145000",
    "payeeName": "㈱東京アルファライン",
    "name": "㈱東京アルファライン",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1521000",
    "supplierCode": "1521000",
    "supplierName": "㈱浜田東京リサイクルセンター",
    "payeeCode": "1521000",
    "payeeName": "㈱浜田東京リサイクルセンター",
    "name": "㈱浜田東京リサイクルセンター",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_2711000",
    "supplierCode": "2711000",
    "supplierName": "横浜ｺﾞﾑ㈱平塚製造所",
    "payeeCode": "2711000",
    "payeeName": "横浜ｺﾞﾑ㈱平塚製造所",
    "name": "横浜ｺﾞﾑ㈱平塚製造所",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4103"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1024000",
    "supplierCode": "1024000",
    "supplierName": "㈱セイミツ",
    "payeeCode": "1024000",
    "payeeName": "㈱セイミツ",
    "name": "㈱セイミツ",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1161007",
    "supplierCode": "1161007",
    "supplierName": "ﾏｯｸｽﾊﾞﾘｭ秦野渋沢店(田丸)",
    "payeeCode": "1161000",
    "payeeName": "㈱田丸",
    "name": "ﾏｯｸｽﾊﾞﾘｭ秦野渋沢店(田丸)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1970",
      "4114"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0697002",
    "supplierCode": "0697002",
    "supplierName": "横浜国立大学（後藤）",
    "payeeCode": "0697000",
    "payeeName": "㈱後藤",
    "name": "横浜国立大学（後藤）",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1623000",
    "supplierCode": "1623000",
    "supplierName": "藤産商㈱",
    "payeeCode": "1623000",
    "payeeName": "藤産商㈱",
    "name": "藤産商㈱",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1200"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0383000",
    "supplierCode": "0383000",
    "supplierName": "大本紙料㈱",
    "payeeCode": "0383000",
    "payeeName": "大本紙料㈱",
    "name": "大本紙料㈱",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1984"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0384117",
    "supplierCode": "0384117",
    "supplierName": "資さんうどん平塚店（大本）",
    "payeeCode": "0384000",
    "payeeName": "大本紙料㈱",
    "name": "資さんうどん平塚店（大本）",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_1205201",
    "supplierCode": "1205201",
    "supplierName": "鴻池運輸㈱厚木流通ｾﾝﾀｰ",
    "payeeCode": "1205000",
    "payeeName": "㈱ＤＳＰ",
    "name": "鴻池運輸㈱厚木流通ｾﾝﾀｰ",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1603"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0502029",
    "supplierCode": "0502029",
    "supplierName": "ｶｲﾝｽﾞ鎌倉梶原店ﾊﾞｯｸﾔｰﾄﾞ(河村)",
    "payeeCode": "0502000",
    "payeeName": "河村商事㈱　ｶｲﾝｽﾞ",
    "name": "ｶｲﾝｽﾞ鎌倉梶原店ﾊﾞｯｸﾔｰﾄﾞ(河村)",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "1000",
      "4128",
      "1970",
      "4143"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  },
  {
    "id": "c_0859000",
    "supplierCode": "0859000",
    "supplierName": "ＪＰロジネット㈱",
    "payeeCode": "0859000",
    "payeeName": "ＪＰロジネット㈱",
    "name": "ＪＰロジネット㈱",
    "kana": "",
    "area": "",
    "address": "",
    "jobType": "regular",
    "scheduleRules": {
      "mon": [],
      "tue": [],
      "wed": [],
      "thu": [],
      "fri": [],
      "sat": [],
      "sun": []
    },
    "holidayCollection": false,
    "defaultDuration": 30,
    "requiredVehicle": "",
    "items": [
      "4098"
    ],
    "note": "[CSV新規補充] ",
    "isInvalid": false
  }
];

export const INITIAL_DRIVERS = [
  { id: 'd1', name: '', currentVehicle: '', color: 'bg-blue-50 border-blue-200', defaultSplit: null, course: 'A' },
  { id: 'd2', name: '', currentVehicle: '', color: 'bg-green-50 border-green-200', defaultSplit: null, course: 'B' },
  { id: 'd3', name: '', currentVehicle: '', color: 'bg-purple-50 border-purple-200', defaultSplit: null, course: 'C' },
  { id: 'd4', name: '', currentVehicle: '', color: 'bg-orange-50 border-orange-200', defaultSplit: null, course: 'D' },
];

export const TIME_SLOTS = [];
for (let h = 6; h < 18; h++) {
  ['00', '15', '30', '45'].forEach(m => {
    TIME_SLOTS.push(`${h}:${m}`);
  });
}

export const INITIAL_JOBS = [
  { id: 'j1', title: '富士電線', driverId: 'd1', startTime: '6:30', duration: 30, originalCustomerId: 'c99' },
  { id: 'j2', title: '厚木事業所', driverId: 'd2', startTime: '7:00', duration: 60, originalCustomerId: 'c98' },
];

// レイアウト定数
export const QUARTER_HEIGHT_REM = 2;
export const PIXELS_PER_REM = 16;
export const CELL_HEIGHT_PX = QUARTER_HEIGHT_REM * PIXELS_PER_REM;
