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
  { id: '4d4acc0d-13ec-4e3d-a345-c497604dfb97', name: '畑澤', kana: 'はたざわ', license_types: ['普通', '中型', '大型'], is_active: true },
  { id: 'bd18c658-ac8f-46ec-a7eb-504320e1377f', name: '菊地', kana: 'きくち', license_types: ['普通', '中型'], is_active: true },
  { id: 'a49eea90-4fcb-43cf-8c42-7ea37d978236', name: '万里', kana: 'ばんり', license_types: ['普通', '中型'], is_active: true },
  { id: '6886f1ed-2769-427c-bdd2-33bf93b476bb', name: '片山', kana: 'かたやま', license_types: ['普通', '中型', '大型'], is_active: true },
  { id: 'fa468431-4e5d-4140-892c-741d8b24be27', name: '大貴', kana: 'だいき', license_types: ['普通'], is_active: true },
  { id: 'e5b3311d-6c13-4686-b85f-b65de84470b1', name: '鈴木', kana: 'すずき', license_types: ['普通', '中型'], is_active: true },
  { id: 'fbe4f8c4-889f-4723-b46b-e57f76bc7537', name: '佐藤', kana: 'さとう', license_types: ['普通'], is_active: true },
  { id: '57beed03-99f9-4681-9022-fd9d1eb44b75', name: '田中', kana: 'たなか', license_types: ['普通', '中型'], is_active: true },
];


// 初期マスターデータ（vehiclesマスタ）
export const INITIAL_VEHICLES = [
  { id: '283dc293-7961-44a7-b675-3c76ed0a4222', name: '2025PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: '96019ef0-d815-4a96-866c-c9639f03090f', name: '2267PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: '2d7fcb8f-4320-4d8a-b1f9-a9e8d648a511', name: '2618PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: 'f625c6eb-9fb1-44e1-9e1b-6f6761f6f2dd', name: '5122PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: '03a4e1de-f59d-4462-a615-af8d90f9b3cc', name: '1111PK', vehicle_type: 'packer_2t', max_capacity_kg: 2000 },
  { id: '1f9e97fd-06ba-4c61-a9c3-5bff3f33a61d', name: '西濃運輸', vehicle_type: 'flat_4t', max_capacity_kg: 4000 },
  { id: '2e0c46aa-a437-4cd5-89f5-e0cb9d193a93', name: '予備車', vehicle_type: 'other', max_capacity_kg: null },
  { id: '3d794c1a-9b3f-4e7f-9af1-8a3e4d379195', name: 'レンタカー', vehicle_type: 'rental', max_capacity_kg: null },
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
    "id": "3df2fafe-7b0e-449b-a783-bb8793c17a34",
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
    "id": "2d384904-07fc-4e70-858e-9f4ee1424922",
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
    "id": "a5597f6b-0dd4-484d-bed1-dda0107e8764",
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
    "id": "a4687fcf-bbe8-4d1a-8261-5c11475edf4a",
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
    "id": "9eca3c0f-364c-4f0f-b0d0-a3c646b8a461",
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
    "id": "cc3734e9-81f1-488d-87e7-97cf7f751398",
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
    "id": "688f70c9-843f-4fbb-ba16-7929be65d320",
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
    "id": "f874b88b-3634-496e-818e-44b325c303ae",
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
    "id": "e2d29897-347f-4b4f-8c34-6d433b7a09c5",
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
    "id": "acf3acb7-cc13-400d-ab23-3ff4942ab38f",
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
    "id": "3b3cdd2b-0271-4a62-aa8d-19d323d7c974",
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
    "id": "592442b5-ee42-4086-bb1d-69d46647dc6f",
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
    "id": "949e5a69-5212-46dd-a445-73027cf0bfa9",
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
    "id": "af29233f-7216-491c-9b7a-7732cdfa8ac5",
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
    "id": "837f383b-5220-4c0d-a627-d533c84acebf",
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
    "id": "ce2eff8f-c33a-4772-baf2-e82f001edb77",
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
    "id": "ad93c6df-d941-4d61-85ce-ceec1c8be681",
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
    "id": "350ddc63-8900-4f09-ba48-28d99e533532",
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
    "id": "7bef292e-f65d-4ee3-860f-b569e4be551b",
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
    "id": "51bbb12b-974f-4542-b246-a2e09f9ca98b",
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
    "id": "956dc0e3-778a-4df7-a7fc-e972d93b0647",
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
    "id": "129854d0-458a-4825-b3cd-93af9959780d",
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
    "id": "0a4f4dea-add5-4d6c-b601-c7bc0a9b9370",
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
    "id": "403d3481-75e0-4f5c-9f98-4bbd93bb6c0e",
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
    "id": "c4819fa4-aa8a-472c-8a25-3d3ec364716f",
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
    "id": "7eb1b830-8902-4654-b7a3-da0944a4a629",
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
    "id": "9c44e5b7-e5d4-4033-b47e-ef271922e3e0",
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
    "id": "a4cde9b9-2f81-4144-b913-c23c039a64af",
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
    "id": "f235c980-ec89-4b7b-a011-9f6e7ed7a480",
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
    "id": "2977ff66-d020-4868-b7b0-cffac54417f5",
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
    "id": "6ca192f6-95e1-4dc9-8d23-c6267bade44b",
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
    "id": "dfc59b0a-e9e0-49e2-a674-d0b6ba801f35",
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
    "id": "06c37234-2e0d-4e16-923d-132aeef32d8a",
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
    "id": "3fa15502-16b9-43a0-9397-d5a0ae86bb6a",
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
    "id": "e24dea20-50dd-4c49-a47f-876226ccaa31",
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
    "id": "b188b123-19e0-45a6-908c-bdf786c4f740",
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
    "id": "c05a451c-04e1-4949-a31e-89e66bbef49a",
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
    "id": "e4b53690-0ffa-4e18-b171-4aa50de3c336",
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
    "id": "2e11c0d2-bf81-4bc6-a98e-179b614648f7",
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
    "id": "e304f5d7-5868-40c8-80ec-2691cb99ec54",
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
    "id": "80ed970b-fb1e-423c-b471-e3d39b322a57",
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
    "id": "0f886e4d-79e1-4c9e-9ba8-dcc099333955",
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
    "id": "ec6ca078-945b-4dd9-b52d-22b466d33fdc",
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
    "id": "1ec86170-47fd-4f4a-85f7-933afa8133ca",
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
    "id": "fc767c3c-0920-48ad-b3d2-9a6471401970",
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
    "id": "16e48118-174f-4fda-b213-dfd928993837",
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
    "id": "7cbc83c6-8fc8-4112-86c3-3b9ca7cb3729",
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
    "id": "34cfe2d2-44d5-40f4-b0dd-2691f72d4f2c",
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
    "id": "5244e522-dfc1-410d-ae09-105b83e45f9e",
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
    "id": "62229912-8861-481e-a039-446fdc36aec8",
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
    "id": "ef563b39-74d2-4d96-8b23-95e26879e9d2",
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
    "id": "b59b9077-7733-4e8e-8742-7c428c75047e",
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
    "id": "e7a38491-b6ac-452b-bf2a-fb06fdd225df",
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
    "id": "410f3890-b439-49a0-82ba-c8db978c1f5f",
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
    "id": "80880ce2-d74a-4e60-b5c3-d4ede431fe92",
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
    "id": "7282b3ea-ffa8-45c9-8341-c362f77a3d2a",
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
    "id": "2820887f-3070-4f21-80e7-af73451f0e13",
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
    "id": "1b7ae661-880a-4d13-86cb-b94b4202ed79",
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
    "id": "433710b1-2aa9-4779-965a-783fcf5a955c",
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
    "id": "fe075f2a-b30d-4610-8642-07d950fe2c3a",
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
    "id": "69595ee7-4700-463f-b6b3-053c0693434f",
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
    "id": "61d1e3f8-c2ba-4f54-bcbc-3452087dfb14",
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
    "id": "2a76fed0-8652-4b6b-9d15-5014410f4b78",
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
    "id": "f8a66a0d-03d6-4ed4-b3a5-21d570cff13c",
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
    "id": "9a72643e-b697-42a1-ad2c-d43b1a829129",
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
    "id": "c7ae8cb8-1816-45ea-bf59-b7554ce5251f",
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
    "id": "6c13a171-c128-421d-914e-0ed78662f3e9",
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
    "id": "71fb097e-3885-481a-8f6f-c91b369a064b",
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
    "id": "a130ca96-38ff-473d-b9df-446e6c435be1",
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
    "id": "260b37a5-1651-4c00-b666-7b07cad127b5",
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
    "id": "164f4ec5-dd88-495f-bd0a-38d4e672351b",
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
    "id": "1a61c5b2-d324-4a36-8d98-245d44fbeb75",
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
    "id": "a06023a5-32bb-413d-8df7-8baeaed6787d",
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
    "id": "e74e1903-de84-4519-b292-17116aa04ae9",
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
    "id": "032ca829-a77f-418a-8fdb-9a92033a7e05",
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
    "id": "b5dd8039-7879-4bd2-9315-44ed2215c830",
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
    "id": "d532c954-7547-4de8-84df-4c74f30b901b",
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
    "id": "3d77b357-c547-4b8b-b14e-eadf499749df",
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
    "id": "d921d186-5ba9-4aa5-870d-6a9f81fb4f80",
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
    "id": "b78256f2-b451-46da-af7e-b97b2c58a836",
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
    "id": "06b20258-4ffd-4180-bb28-3ac958e1ee14",
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
    "id": "6c87b64b-3e87-455a-b7d5-9a2cfd14d15d",
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
    "id": "f5ed5fc9-ed96-4c20-afdc-ce9dffd52c17",
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
    "id": "4224afa9-7427-450a-acac-90c3b00ad003",
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
    "id": "a0de48f6-b58a-409c-a939-1e98fc104c91",
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
    "id": "e98ae4c4-673d-49a2-9369-1a0f010e8d71",
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
    "id": "c460c46b-8219-49a5-a48f-42488a718634",
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
    "id": "1bc7fea3-4b56-452d-affb-a02b7ba495d8",
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
    "id": "e45e1e9f-b252-48dd-85b8-20157f8a63bf",
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
    "id": "a3d245f4-a56f-4eba-9450-1cd3e4bad3cb",
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
    "id": "15006803-543c-442b-b55e-497b2b350d08",
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
    "id": "28d4538c-c784-4259-b2e6-620a40f95130",
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
    "id": "c16f449d-3ecc-4674-85ed-3c73e8d772de",
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
    "id": "3c26f905-6ece-4f8b-a74f-a6a8bf9a5cbe",
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
    "id": "c730f916-3647-4bf8-a6da-0d8db166bff0",
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
    "id": "7f600072-d51a-4388-94d5-d8741e808a33",
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
    "id": "35bfa49f-b867-4bbe-b87c-4cb16b17f91b",
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
    "id": "d61341f3-7063-4a4a-925b-edc8bacb60bd",
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
    "id": "467f9d65-345b-4fa5-8474-ab739a1104fe",
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
    "id": "418cbda4-5b9a-4a52-9b61-904131bdf9d8",
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
    "id": "ea3063ff-1951-4e3f-87e3-9b8d52b3141d",
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
    "id": "5dadfab3-6ea0-49db-8134-ca5e6a661009",
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
    "id": "55fe327a-21de-42f9-986e-8d31f2c59576",
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
    "id": "7e4bd2d6-96de-4a79-b219-b56334366274",
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
    "id": "5054ad31-12c4-4a4f-9e05-2e3f4c963dba",
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
    "id": "aa13b072-0d13-4797-901c-854b06afdaf2",
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
    "id": "150ccd2d-30b7-4d08-a6f4-baf7ddc615c8",
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
    "id": "b0bf14d4-6431-46f3-9b56-803212a01aaf",
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
    "id": "a755200d-ae20-4ea6-9096-267423c79bf1",
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
    "id": "67ee08db-c18e-44cc-8687-47496a1e11ae",
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
    "id": "9c36487d-64e1-4ec0-8a44-50f0d65f19b8",
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
    "id": "0950494c-411f-40d4-b547-37f48353789d",
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
    "id": "56e4dc89-1b42-4501-8850-b43b24532ee1",
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
    "id": "4fa766d6-bf91-4070-b561-837fb3632e80",
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
    "id": "6c1ac0b9-f321-4f2c-8e7d-4c59157dab38",
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
    "id": "74195eda-2c2b-4f88-961b-d797434f2db2",
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
    "id": "3e9dab82-bfd6-44ad-a575-721d894675e9",
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
    "id": "b4b5763c-0d88-4a20-93d1-99dc98ae93b2",
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
    "id": "d1c6f043-f727-401c-a2c7-f9345aea1551",
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
    "id": "a0ed686e-8f11-4727-890b-b18ce13486a6",
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
    "id": "5bca35fb-e6fd-4885-accc-fae3bd16ef3c",
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
    "id": "37f646b2-507a-4f66-9d4e-abda2064ef97",
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
    "id": "44f0c8f6-c064-420d-a786-40eebfb39b3b",
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
    "id": "9ef2c349-ff98-4f78-9631-740650bcde56",
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
    "id": "96dc9c7d-0990-4ff7-bba2-9de976f17478",
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
    "id": "a22b1d0a-16ab-4678-a52b-b38109b49788",
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
