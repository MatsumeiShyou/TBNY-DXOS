# **次世代配車管理システムにおけるマスタ登録UIの設計哲学と最先端UXパターンの体系的統合**

高度な意思決定支援を目的とする業務アプリケーションにおいて、フロントエンドのユーザーエクスペリエンス（UX）とバックエンドのデータ整合性を両立させるアーキテクチャの設計は極めて複雑な課題である。本稿は、廃棄物回収等の配車・シフト管理を最適化するシステムを対象とし、その根幹をなす「マスタ登録UI」の設計哲学、最先端のUXパターン、そして実装におけるベストプラクティスを網羅的に体系化したものである。本システムは、完全な自動化ではなく「人間の直感的な判断を支援する」という明確な業務コンセプトを持ち、ブラウザネイティブのDnD（ドラッグ＆ドロップ）APIを活用した高度で柔軟な配車操作を提供する1。  
この直感的な操作性を支える技術基盤として、オフラインファースト（Offline-First）および楽観的UI（Optimistic UI）を採用し、フロントエンド（React 19, Tailwind CSS v4）とバックエンド（Supabase PostgreSQL）の間で非同期かつ堅牢なハイブリッドデータ管理（ADR-001）を実現している1。さらに、すべての回収案件（スポット案件を含む）は必ず顧客マスタに紐づく必要があり、親データを持たない「孤児データ（Orphan Data）」を一切許容しないという厳格な業務ルールが課されている1。  
本プロジェクトの最も革新的な側面は、AIエージェントと人間の開発者が協調して安全にシステムを進化させるための「AI統治構造（AI Governance）」が組み込まれている点である。AGENTS.mdを単一真実源（SSOT）として徹底し、リスクベースの3段階ルート（Tier 1〜3）やADR（Architecture Decision Records）を用いて、AIの推測による破壊的変更を抑止している1。本ドキュメントは、このAI統治構造の基盤となるコンテキストを提供し、AIエージェントが高度な業務システムを自律的かつ安全に構築・拡張するための知識ベースとして機能する。

## **業界を牽引するデザインシステムの設計哲学とその統合**

エンタープライズ領域において、マスタデータの登録と管理はシステムの品質と業務効率を決定づける中核要素である。SAP Fiori、Atlassian Design System、Microsoft Fluent UI、SmartHRなどの業界標準デザインシステムは、複雑な業務要件を解決するための洗練された哲学とパターンを確立している1。これらの設計思想を抽出し、本システムが要求する「オフラインファースト」「厳格なデータ整合性」「直感的な操作性」という特異なコンテキストへと統合する。

### **SAP Fioriに学ぶドラフトハンドリングと状態のライフサイクル**

大規模な業務システムにおいて、ユーザーが複数の画面を跨いで複雑なビジネスエンティティを入力する際、システムの中断やネットワークの切断は致命的なデータロストを引き起こす。SAP Fioriは、この課題に対して「ドラフトハンドリング（Draft Handling）」という強力なパラダイムを提供している4。これは、ユーザーが明示的な保存アクションを実行する前に、入力中のデータをバックグラウンドで自動的に中間状態（Draft）として永続化する仕組みである4。

| 状態 (Editing Status) | 定義とシステム上の振る舞い | オフラインファースト・アーキテクチャへの応用 |
| :---- | :---- | :---- |
| **Active Version** | 全ての必須項目が満たされ、バックエンドのデータベースにコミットされた一貫性のあるデータ4。 | バックエンド（Supabase）と完全に同期されたマスタデータ。他のすべてのエンティティから参照可能。 |
| **Own Draft** | ユーザー自身が現在編集中の未保存データ。自動保存の対象となる4。 | オフライン時にローカルストレージ（IndexedDB等）に保持される中間状態。オンライン復帰時にバックエンドと同期される6。 |
| **Locked** | 悲観的排他制御（Pessimistic Locking）により、他のユーザーによる編集・更新・削除が禁止されている状態4。 | 競合を防ぐため、オンライン状態でのみ有効な制約。オフライン時はCRDT等の競合解決戦略が必要となる6。 |
| **Unsaved Changes** | 他ユーザーによる未保存の変更が存在し、ロック期間が経過した状態4。 | 楽観的ロック（Optimistic Locking）下において、マスタデータの競合や上書きのリスクを視覚的に警告する9。 |

本システムでは、ADR-001に基づくハイブリッドデータ管理を採用しているため、日々の配車オペレーションにおいてオフライン状態でもマスタの参照や案件の登録が可能でなければならない1。したがって、マスタ登録UIは常に「Active」と「Draft」の二元的な状態モデル（State Machine）を管理する設計が求められる。ネットワークが遮断された環境下で顧客マスタが新規作成された場合、それはローカルのJSONやIndexedDB上に「Draft」としてキューイングされ、UI上は即座に利用可能（Optimistic UI）として振る舞いながら、接続回復時にバックエンドと調停（Reconciliation）を行うアーキテクチャが必須となる6。

### **Atlassian Design Systemに学ぶコンテキスチュアル・クリエーション**

Atlassian Design Systemの根底にある哲学は、「ユーザーの現在の認知コンテキストを断ち切らないこと」である11。特に、直感的な操作が求められる本システムの配車オペレーターにとって、画面の遷移は著しい認知負荷をもたらす。配車をドラッグ＆ドロップで割り当てている最中に、未登録の新規顧客や回収品目が必要になった際、マスタ登録専用の別画面へ強制的に遷移させるアプローチは、オペレーターの思考プロセスを完全に破壊する。  
この問題を解決するのが「コンテキスチュアル・クリエーション（Contextual Creation）」あるいは「インライン作成（Inline Creation）」と呼ばれるパターンである3。配車画面上にモーダル（Modal）やドロワー（Drawer）、あるいはインラインのポップオーバーを展開し、ユーザーが現在のタスク（配車）の文脈を維持したまま、シームレスに新しいマスタレコードを作成できるように設計する3。Atlassianのガイドラインが示す通り、システムの透明性と信頼性を担保するためには、このインライン作成時にも標準のマスタ登録と同等のバリデーションとエラーフィードバックを瞬時に提供しなければならない11。

### **Microsoft Fluent UIが提示する情報の階層化とマスター詳細パターン**

Microsoft Fluent UIは、複雑なデータセットを扱う際に、視覚的な階層（Depth）とフォーカスを用いて情報の優先順位を制御するアプローチを提唱している1。本システムでは「手動一括操作UIを優先する」という要件が存在するため、数十から数百の顧客マスタや品目マスタを俯瞰し、迅速に編集できるデータグリッド（スプレッドシート型UI）の導入が適している1。  
しかし、エンタープライズデータのすべてをフラットな表形式で表示することは、認知的なオーバーロードを引き起こす。ここで活用されるのが「マスター・詳細（Master-Detail）」パターンと「段階的開示（Progressive Disclosure）」の原則である17。グリッド上には名称や連絡先といった識別に必要な最低限の属性のみを表示し、特定の行を選択またはホバーした際に、画面の右側や下部に詳細パネル（Detail Panel）が展開される構成をとる17。これにより、回収ルートの特約や請求条件といった高度なマスタ設定項目は、ユーザーがそれを必要としたタイミングでのみ開示され、心理的な入力ハードルを劇的に低下させることができる1。

### **SmartHRとfreee vibesにおける日本的業務慣習とアクセシビリティ**

国内向けのB2B SaaS領域を牽引するSmartHRやfreee vibesのデザインシステムは、日本の複雑な業務慣習に最適化された入力支援と、高度なウェブアクセシビリティの実践において極めて示唆に富んでいる1。  
フォームの入力検証（バリデーション）において、ユーザーが送信ボタンを押下して初めて大量のエラーを提示するアプローチは、ユーザーのフラストレーションを増大させる。インラインバリデーションを活用し、入力フィールドからフォーカスが外れた（onBlur）時点、あるいは入力中（onChange）にリアルタイムでフィードバックを提供することが不可欠である23。さらに重要な点として、SmartHRのガイドラインが指定するように、ユーザーが入力値を修正してエラーの原因が解消された瞬間に、エラーメッセージの表示と入力フィールドのエラー意匠を即座に取り下げるシステム上の応答性が求められる21。  
アクセシビリティの観点からは、アイコンのみで構成されたボタン（例：マスタの削除ボタン）には必ずスクリーンリーダー用の明示的な代替テキスト（aria-label等）を付与し、複雑な依存関係を持つ入力項目群はFieldsetを用いてセマンティックにグループ化することが、すべてのユーザーに対して操作性を保証する基盤となる17。さらに、日本の業務システム特有の要件として、郵便番号からの住所自動補完や、法人番号APIと連携した企業情報の自動取得といった「スマートデフォルト」機能を組み込むことで、マスタ登録の手間を最小限に抑え、オペレーターの業務効率を最大化する1。

## **オフラインファースト環境下での最先端UXパターンの実装**

本システムは、ブラウザネイティブのDnD APIを用いた直感的な配車操作と、バックエンドとの非同期なデータ同期を組み合わせたアーキテクチャを持つ1。この環境下において、ユーザーの操作を遅延なく画面に反映させつつ、ネットワークの不安定さやデータ競合からシステムを保護するためのUXパターンを定義する。

### **楽観的UI（Optimistic UI）の心理的効果とロールバック戦略**

楽観的UIは、サーバー側での処理の完了を待たず、ユーザーの操作が成功したものと仮定して即座にローカルのUI状態を更新する設計パターンである8。このアプローチは、ネットワークのレイテンシ（遅延）を隠蔽し、アプリケーションがローカルネイティブアプリであるかのような錯覚（Illusion of instant response）をユーザーに与えることで、体感パフォーマンスを飛躍的に向上させる29。配車オペレーターがドラッグ＆ドロップで案件を車両に割り当てる際、都度ローディングスピナーが表示されて操作がブロックされることは許容されないため、本システムにおいて楽観的UIの採用は必然である。  
しかし、楽観的UIは「偽陽性（False Positives）」という構造的なリスクを内包している28。サーバー側でのバリデーションエラー、データベースの一意性制約違反、あるいはネットワークの完全な切断などにより、バックグラウンドでの「シャドウリクエスト（Shadow Request）」が失敗するシナリオを常に想定しなければならない29。  
操作が失敗した場合、システムはユーザーの視界でUIを以前の状態に差し戻す「ロールバック（Rollback）」を実行する必要があるが、これはユーザーに強い混乱とシステムへの不信感をもたらす8。この認知的摩擦を軽減するためには、エラーフィードバックのUXが極めて重要となる。単に元の状態に戻すだけでなく、トースト通知（Toast Notification）を用いてエラーの事実を明示しつつ、影響を受けたマスタや案件のUI要素をインラインでハイライト（例えば赤枠や警告アイコンの付与）し、「なぜ失敗したのか」「次に何をすべきか（再試行ボタンの提示など）」を明確に伝えるハイブリッドなエラーハンドリングがベストプラクティスとされる30。

### **孤児データ（Orphan Data）を排斥する制約ベースUI**

「すべての回収案件は必ず顧客マスタに紐づき、孤児データを許容しない」という厳格な業務ルールは、単にバックエンドのデータベース制約（外部キー制約）として実装するだけでは不十分である1。バックエンドでエラーを弾く前に、フロントエンドのUIレベルで不整合なデータが入力・操作されることを物理的に防ぐ「制約ベースUI（Constraint-based UI）」の概念が必要となる。  
この原則は、マスタデータの削除操作において最も先鋭化する。顧客マスタを削除しようとした際、その顧客に紐づく過去の回収案件や将来の配車予定（Jobデータ）が存在する場合、バックエンドでカスケード削除（ON DELETE CASCADE）を無差別に実行することは、意図せぬ大量のデータ喪失を引き起こす1。したがって、削除アクションの実行前には、影響を受ける子レコードの件数と影響範囲を計算し、警告モーダル（Confirmation Modal）を通じてユーザーに明示的な同意を求める段階的なインターフェースが不可欠である1。  
さらに、廃棄物回収業務のような監査証跡（マニフェスト等）が法的に要求されるドメインにおいては、データの物理削除（Hard Delete）自体がアンチパターンとなることが多い37。データベース設計の観点からも、大規模なテーブルにおけるカスケード削除は広範囲なロック競合（Lock Contention）を引き起こし、システムのパフォーマンスを著しく低下させることが実証されている36。そのため、本システムでは deleted\_at などのタイムスタンプカラムを用いた論理削除（Soft Delete）を標準アーキテクチャとし、UI上では論理削除されたマスタを「アーカイブ済」としてフィルタリングするパターンを採用することが、データの参照整合性とパフォーマンス要件の双方を満たす最適解となる36。

## **React 19とTailwind CSS v4によるモダンフロントエンド・アーキテクチャ**

提示された技術スタック（React 19, Tailwind CSS v4, Vite v7）は、前述の高度なUXパターンを効率的かつ予測可能に実装するための最新のパラダイムを提供する1。AIエージェントは、これらの技術特性を深く理解し、公式のベストプラクティスに準拠したコードを生成しなければならない。

### **React 19における並行レンダリングと楽観的状態管理**

React 19は、非同期処理とUI状態の同期に関する複雑なボイラープレートを排除し、並行レンダリング（Concurrent Rendering）の能力を最大限に引き出す新しいフック群（Hooks）を提供している40。楽観的UIの実装において、従来のReact 18以前では、真実の状態（サーバー状態）と楽観的な状態（ローカル状態）を別々の useState で管理し、エラー時のロールバックロジックを手動で記述する必要があったが、これは状態の不整合（Stale Closures）を引き起こす温床であった33。  
React 19で導入された useOptimistic フックは、この課題を根本から解決する。useOptimistic は、ベースとなる状態（Propsや上位コンポーネントからの確定済データ）を第一引数に取り、非同期トランザクション（Action）が進行中である間のみ、一時的にUIを上書きする楽観的状態を生成する33。 非同期処理は startTransition またはフォームのアクション状態を管理する useActionState でラップされる41。トランザクションが成功して親からのベース状態が更新されるか、あるいはトランザクションがエラーを投げて失敗した場合、useOptimistic は自動的に一時的な状態を破棄し、UIを真実の状態へと安全に調停（Reconcile）する33。  
配車ボードにおけるドラッグ＆ドロップ実装においても、このメカニズムは極めて有用である。何百もの案件データ（Job）をマスタに紐づけて移動させる際、配列全体に対して不用意に useOptimistic を適用すると、全要素の再レンダリングが発生しパフォーマンスが低下するリスクがある46。これを防ぐため、リストの個別のアイテムレベルに楽観的状態をカプセル化し、一意のキー（Key）に基づいたReactの差分検出アルゴリズム（Diffing Algorithm）を効率的に機能させる高度なコンポーネント設計が、AIエージェントには要求される45。

### **Tailwind CSS v4のCSS-Firstアーキテクチャと自己適応型UI**

スタイリングに採用されているTailwind CSS v4は、基盤となるエンジンがゼロから再構築され、JavaScriptベースの構成（tailwind.config.js）から、ネイティブCSSの機能をフルに活用するCSS-Firstアーキテクチャへとパラダイムシフトを遂げた48。  
このバージョンでは、デザインシステムのすべてのトークン（色彩、タイポグラフィ、スペーシング）がCSSカスタムプロパティ（CSS Variables）として @theme ディレクティブを通じて定義される48。これにより、SAP FioriやFluent UIにインスパイアされた複雑なテーマ設定や動的な切り替え（ダークモード対応など）が、コンポーネントの再レンダリングを伴わずに、ブラウザのレンダリングエンジンレベルで高速に処理される48。  
特に注目すべき新機能が、外部プラグインなしでネイティブサポートされた「コンテナクエリ（Container Queries）」である48。従来のメディアクエリ（Media Queries）がブラウザのビューポート幅に依存していたのに対し、コンテナクエリは親要素（コンテナ）の物理的な幅に基づいて子要素のスタイルを動的に変更できる。マスタ詳細（Master-Detail）パターンにおいて、詳細パネルが画面の右側に展開され、メインのデータグリッドの表示領域が狭まった場合、@container と @sm: などの修飾子を用いることで、グリッド内のレイアウトをテーブル形式からカード形式へ自動的に再構成する「自己適応型UI（Self-Adaptive UI）」を極めて簡潔なコードで実現可能にする2。  
また、複数のユーティリティクラスを組み合わせて再利用可能なコンポーネント（ボタンやカード等）を定義する際、従来の @apply の過度な使用は生成されるCSSの肥大化を招いていた。v4では、新たに導入された @utility ディレクティブを使用することで、パフォーマンスを犠牲にすることなく、独自のカスタムクラスをTailwindのコンパイルパイプラインに安全に統合できる51。

## **Supabase (PostgreSQL) におけるデータ整合性とパフォーマンスの極大化**

フロントエンドにおけるUXの追求は、バックエンドの堅牢なデータ保護メカニズムによって裏打ちされなければならない。Supabase（PostgreSQL）を基盤とする本システムにおいて、データアクセス制御と整合性の担保は、データベースレイヤーで直接施行される。

### **外部キー制約とエラーコード 23503 のコンテキストマッピング**

「すべての回収案件は必ず顧客マスタに紐づく」という制約は、PostgreSQLの外部キー制約（Foreign Key Constraint）によって物理的に保証される1。ADR-001のハイブリッドデータ管理下において、フロントエンドでオフライン時に作成された案件（Job）データが、まだサーバーに同期されていない新規の顧客マスタIDを参照したままオンライン復帰時に挿入（INSERT）を試みた場合、PostgreSQLは即座にエラーコード 23503 (Foreign Key Violation) を発生させる55。  
システム設計上、APIクライアントはこの 23503 エラーを単なる「サーバー内部エラー（HTTP 500）」として握り潰してはならない。このエラーは、クライアント側のデータ同期順序の不整合に起因するものである。したがって、エラーハンドリング層においてこのPostgreSQL固有の例外を正確に捕捉し、「紐づく顧客マスタがサーバーに存在しません。マスタデータの同期を先に完了させてください」といった、オペレーターにとって actionable（行動可能）なコンテキストを持つUIメッセージへと変換（Error Mapping）するロジックの実装が不可欠である56。

### **行レベルセキュリティ（RLS）の陥穽とエラーコード 42501**

Supabaseの認証（GoTrue）と統合された行レベルセキュリティ（Row Level Security: RLS）は、マルチテナントSaaSや権限ベースのデータアクセスをデータベースのカーネルレベルで制御する極めて強力な機能である1。しかし、RLSの設計には直感に反する厳密な仕様が存在し、AIによる自動生成コードにおいて頻発するアンチパターンが存在する。  
その代表例が、エラーコード 42501 (Insufficient Privilege / New row violates row-level security policy) による INSERT 処理の失敗である60。ReactアプリケーションからSupabaseクライアントを用いてデータを挿入し、同時に挿入されたデータを取得するため insert().select() を実行した場合、対象のテーブルに対して INSERT を許可するポリシー（WITH CHECK）が存在していても、**対象行を読み取るための SELECT ポリシー（USING）が定義されていなければ、トランザクション全体がポリシー違反として拒否される**61。AIエージェントがマスタテーブルのマイグレーションやポリシーを生成する際は、単一の操作だけでなく、PostgREST APIの挙動を前提とした包括的なポリシー（SELECT, INSERT, UPDATE, DELETE）のセットを漏れなく定義することが要求される58。

### **RLSのパフォーマンスチューニングと SECURITY DEFINER パターン**

RLSはクエリの実行時に、対象となるすべての行に対して評価されるため、ポリシーの記述方法がデータベースのパフォーマンスを決定的に左右する64。例えば、ポリシーの条件式内に auth.uid() を直接記述したり、別の権限管理テーブルとのJOINを含むサブクエリを記述したりした場合、PostgreSQLのクエリプランナーはインデックススキャンを放棄し、全行に対するネステッドループ（Nested Loop）とシーケンシャルスキャンを強制されることがある。これは、データ量が数万件を超えるマスタテーブルにおいて、クエリ速度を10倍から100倍悪化させる致命的なボトルネックとなる64。  
このパフォーマンスの壁を突破するための業界標準プラクティスが、検証ロジックの関数化とキャッシングである。ユーザーの権限やテナントIDを取得する複雑なロジックを、独立したPostgreSQL関数として定義する。この関数には、実行者の権限を関数の所有者レベルに引き上げる SECURITY DEFINER 属性と、単一のトランザクション内で同じ入力に対して常に同じ結果を返すことをオプティマイザに宣言する STABLE 属性を付与する64。 RLSポリシー側では、直接条件を記述する代わりに USING (team\_id IN (SELECT get\_user\_teams())) のように、この最適化された関数を SELECT 文でラップして呼び出す。これにより、関数はクエリごとに一度だけ評価されてキャッシュされ、テーブル側のインデックス（B-Tree等）が有効に機能するようになり、劇的なパフォーマンス向上を実現する64。

## **AIエージェントとの協調を支える統治構造とコンテキスト・エンジニアリング**

現代のソフトウェア開発において、大規模言語モデル（LLM）に基づくAIエージェントの能力を最大限に引き出すためには、プロンプトの工夫を超えた、プロジェクト全体の「統治構造（Governance Structure）」と「コンテキスト・エンジニアリング（Context Engineering）」の基盤が必要不可欠である。AIは膨大な一般的な知識を持つ反面、ステートレス（状態を持たない）であり、プロジェクト固有の暗黙知や過去の意思決定の経緯を自律的に把握することはできない68。コンテキストを与えられなかったAIは、本システムの「孤児データを許容しない」といった制約を無視し、一般的な（しかしプロジェクトにとっては破壊的な）コードパターンへと回帰してしまう危険性がある68。

### **SSOTの確立とDDD（Documentation Driven Development）の実践**

本プロジェクトのAI統治構造の核となるのが、リポジトリ内に配置された AGENTS.md を「最高憲法（Supreme Constitution）」すなわち単一真実源（SSOT: Single Source of Truth）として機能させることである1。これに加えて、DESIGN.md やアーキテクチャごとの .md ファイルをインフラストラクチャとして構築する「Documentation Driven Development (DDD)」のパラダイムを実践する68。  
AIに与えるコンテキストドキュメントは、単なる情報の羅列であってはならない。効果的なコンテキスト・エンジニアリングは「3Sルール」に従うことが求められる68。

> 1. **Selected（厳選された情報）**: AIがタスクを遂行するために必要な情報のみを抽出し、ノイズを排除する。  
> 2. **Synthetic（合成・要約）**: 冗長な記述を避け、極限まで短く、かつ行動可能（Actionable）な形に蒸留する。  
> 3. **Structured（構造化）**: 見出し、箇条書き、マークダウンのテーブルを駆使し、AIのパーサーが論理構造を正確に解釈できるようにフォーマットする。

「AIの記憶をグローバル変数のように扱うこと」は強力なアンチパターンである68。毎回のセッションで過去のチャット履歴に依存するのではなく、意思決定やコーディング規約（例：React 19の useOptimistic 実装パターン、RLSエラー 42501 の回避手順など）は、常にバージョン管理されたマークダウンファイル群（.ai\_context/ など）に永続化されなければならない68。AIエージェントはコードを生成する前に必ずこれらのドキュメントを読み込み、プロジェクトの制約の「ハーネス（安全帯）」の中で作動することが強制される68。

### **MADR（Markdown Architecture Decision Records）による文脈の保護**

アーキテクチャの変更や技術選定における「なぜその決定を下したのか（Why）」という背景情報は、コード自体からは読み取ることができない。本システムでは、マスタデータのハイブリッド管理（ADR-001）や、標準のDnDライブラリではなくブラウザネイティブAPIの自前実装を選択した理由などを、MADR（Markdown Any Decision Records）フォーマットを用いてドキュメント化している1。  
Michael Nygardによって提唱されたADRの概念を受け継ぐMADRは、「Title」「Status」「Context」「Decision」「Consequences」というシンプルかつ構造化されたセクションから成り、否定的な影響（Trade-offs）も包み隠さず記録する72。AIエージェントに対しては、「コードの大規模なリファクタリングやアーキテクチャの変更を伴う提案を行う前に、必ずリポジトリ内のADR群を走査し、過去の設計判断とトレードオフの文脈を検証すること」という厳格なルールを適用する3。これにより、AIが「より一般的なライブラリの導入」などを良かれと思って提案し、システムの根幹要件を破壊する事態を未然に防ぐことができる3。

### **リスクベースの3段階ルート（Tier 1〜3）によるフェイルセーフ**

AIが担うタスクは、その影響範囲によってシステムの安定性に及ぼすリスクが大きく異なる。ROI（投資対効果）を最大化しつつ安全性を担保するため、システムへの変更は重大度に応じた3段階の承認プロセス（Tier 1〜3）によって自動的にルーティングされる1。

| リスクレベル | 変更の特性と対象例 | 実行と承認のプロセス要件 |
| :---- | :---- | :---- |
| **Tier 1 (低リスク)** | 文言の修正、Tailwind CSSを用いたUIの色や余白の微調整、ツールチップの追加等。 | AIエージェントによる完全な自律的コード生成。静的解析と自動テストを通過した場合、人間の介入なしでコミット・デプロイが許可される1。 |
| **Tier 2 (中リスク)** | useOptimistic を活用した状態管理ロジックの実装、新規APIルートの追加、配車DnDコンポーネントの内部リファクタリング等。 | AIはPull Request（PR）の作成までを担当。人間のテックリードによるコードレビューと、実際のブラウザ上でのインラインUI挙動（ロールバック処理等）の目視確認を必須のゲートとする1。 |
| **Tier 3 (高リスク)** | データベーススキーマの変更、外部キー制約の追加・削除、Supabase RLSポリシーの再構築、アーキテクチャの根幹に関わるライブラリの入れ替え等。 | コード生成の前に、DESIGN.md によるアーキテクチャ設計案の作成と人間による承認を必須とする。AIはDDLや移行スクリプトを生成するのみであり、本番環境への適用は専任のDBA（データベース管理者）がバックアップの確保等と合わせて手動で実行する1。 |

この階層的なフェイルセーフ構造により、AIの「探索（Explore）」「計画（Plan）」「実装（Implement）」「検証（Verify）」という反復ループが、システムの破壊を招くことなく、生産性の向上のみに寄与する環境が構築される69。

## **結論**

高度な配車・シフト管理を実現する本システムにおいて、マスタ登録UIは単なるデータ入力フォームではなく、背後に流れる複雑な配車オペレーションを支える「インテリジェントなコントロールパネル」である。人間の直感的な意思決定を最大限に尊重するためには、システムの反応速度とデータの信頼性が不可分に結びついている必要がある。  
SAP FioriやAtlassian、Fluent UIから抽出された「ドラフトハンドリング」「コンテキスチュアル・クリエーション」「段階的開示」といった最先端のデザイン哲学は、ユーザーの認知負荷を取り除き、自然な業務フローを支援する1。技術層においては、React 19の useOptimistic と useActionState が、ネットワークの不確実性を吸収する滑らかな楽観的UIを実現し、Tailwind CSS v4の自己適応型コンテナクエリがあらゆるコンテキストで最適なインターフェースを提供する33。そして、バックエンドのSupabase（PostgreSQL）は、厳格な外部キー制約と、パフォーマンスを極限まで高めた STABLE SECURITY DEFINER 関数を用いたRLSにより、フロントエンドの柔軟性を裏で支える強固な「データの防波堤」として機能する1。  
これらの高度に統合されたシステムは、もはや従来の手法だけで維持・拡張することは困難である。SSOTとしての AGENTS.md、コンテキストを永続化するDDDとADR、そしてリスクに応じたTier 1〜3の開発ルートという「AI統治構造」こそが、この複雑なアーキテクチャを制御する鍵となる1。本ドキュメントに体系化された知識ベースをAIエージェントと人間の双方が共有し、厳格なガバナンスの下で協調することで、本システムはデータ整合性の破壊というリスクを排除しながら、絶え間ない業務要求の変化に迅速に適応し、進化し続けることが可能となる。

#### **引用文献**

> 1. [https://drive.google.com/open?id=1IDImLZd-5Sh5E1HzGM\_ZR1shobPTwnDJlw0yukPcFVk](https://drive.google.com/open?id=1IDImLZd-5Sh5E1HzGM_ZR1shobPTwnDJlw0yukPcFVk)  
> 2. [https://drive.google.com/open?id=1GkJI9DlImLbWOjAi9Gm905lSOCscHTUVj\_0u5FPlklA](https://drive.google.com/open?id=1GkJI9DlImLbWOjAi9Gm905lSOCscHTUVj_0u5FPlklA)  
> 3. [https://drive.google.com/open?id=1VPsFRenI5XadlzOfoTQFqpo3e6IKuXbZ](https://drive.google.com/open?id=1VPsFRenI5XadlzOfoTQFqpo3e6IKuXbZ)  
> 4. Draft Handling \- SAP, [https://www.sap.com/design-system/fiori-design-web/v1-38/foundations/best-practices/global-patterns/object-handling/draft-handling](https://www.sap.com/design-system/fiori-design-web/v1-38/foundations/best-practices/global-patterns/object-handling/draft-handling)  
> 5. How to ensure that users can efficiently enter data in SAP Fiori, [https://community.sap.com/t5/technology-blog-posts-by-sap/how-to-ensure-that-users-can-efficiently-enter-data-in-sap-fiori-elements/ba-p/13565574](https://community.sap.com/t5/technology-blog-posts-by-sap/how-to-ensure-that-users-can-efficiently-enter-data-in-sap-fiori-elements/ba-p/13565574)  
> 6. Best Offline-First Tech Stack For 2026 \- CSS Author, [https://cssauthor.com/offline-first-tech-stack/](https://cssauthor.com/offline-first-tech-stack/)  
> 7. Pessimistic Concurrency Control (Locking) using Un, [https://community.sap.com/t5/technology-blog-posts-by-members/pessimistic-concurrency-control-locking-using-unmanaged-scenario-in-rap/ba-p/14389690](https://community.sap.com/t5/technology-blog-posts-by-members/pessimistic-concurrency-control-locking-using-unmanaged-scenario-in-rap/ba-p/14389690)  
> 8. Building an Optimistic UI with RxDB, [https://rxdb.info/articles/optimistic-ui.html](https://rxdb.info/articles/optimistic-ui.html)  
> 9. Locking in S4HANA via the Durable Locks & CDS View, [https://community.sap.com/t5/technology-blog-posts-by-members/locking-in-s4hana-via-the-durable-locks-cds-view-objectmodel-lifecycle/ba-p/13412190](https://community.sap.com/t5/technology-blog-posts-by-members/locking-in-s4hana-via-the-durable-locks-cds-view-objectmodel-lifecycle/ba-p/13412190)  
> 10. Develop Draft Capable Custom Apps Using BOPF Framework \- Part1, [https://community.sap.com/t5/technology-blog-posts-by-members/develop-draft-capable-custom-apps-using-bopf-framework-part1/ba-p/13472091](https://community.sap.com/t5/technology-blog-posts-by-members/develop-draft-capable-custom-apps-using-bopf-framework-part1/ba-p/13472091)  
> 11. What is a Design System? The Complete Guide, [https://www.onething.design/post/what-is-a-design-system](https://www.onething.design/post/what-is-a-design-system)  
> 12. Designing and developing User Interfaces in 2024, [https://varya.me/design-and-develop-ui-2024/](https://varya.me/design-and-develop-ui-2024/)  
> 13. How to Use SaaS UI Patterns When Building a Design System, [https://www.saasui.design/blog/how-to-use-saas-ui-patterns-building-design-system](https://www.saasui.design/blog/how-to-use-saas-ui-patterns-building-design-system)  
> 14. 12 Best Design System Examples to Learn From \[2026\], [https://www.onething.design/post/best-design-system-examples](https://www.onething.design/post/best-design-system-examples)  
> 15. Institutional Finance Design System \- Ed Chen, [https://edwson.com/design-system-showcase.html](https://edwson.com/design-system-showcase.html)  
> 16. What Makes a Good Design System in Frontend Engineering, [https://www.designsystemscollective.com/what-makes-a-good-design-system-in-frontend-engineering-661dfff757b4](https://www.designsystemscollective.com/what-makes-a-good-design-system-in-frontend-engineering-661dfff757b4)  
> 17. Blogs \- Smart HTML Elements, [https://www.htmlelements.com/blog/](https://www.htmlelements.com/blog/)  
> 18. Directory \- Vaadin, [https://vaadin.com/forum/c/directory/22](https://vaadin.com/forum/c/directory/22)  
> 19. Troubleshooting Common Development Errors | PDF \- Scribd, [https://www.scribd.com/document/752533028/cektitle](https://www.scribd.com/document/752533028/cektitle)  
> 20. Frontend System Design Performance Optimization Guide, [https://frontendatlas.com/guides/system-design-blueprint/performance](https://frontendatlas.com/guides/system-design-blueprint/performance)  
> 21. フィードバック | デザインパターン \- SmartHR Design System, [https://smarthr.design/products/design-patterns/feedback/](https://smarthr.design/products/design-patterns/feedback/)  
> 22. Vibes \- freee, [https://vibes.freee.co.jp/](https://vibes.freee.co.jp/)  
> 23. 10 Website UX Best Practices for 2026 That Convert \- Whisperchat.ai, [https://www.whisperchat.ai/blog/website-ux-best-practices](https://www.whisperchat.ai/blog/website-ux-best-practices)  
> 24. UI/UX Design Review | Skills Marketp... \- LobeHub, [https://lobehub.com/ru/skills/rknall-claude-skills-ui-design-review](https://lobehub.com/ru/skills/rknall-claude-skills-ui-design-review)  
> 25. FormControl | コンポーネント \- SmartHR Design System, [https://smarthr.design/products/components/form-control/](https://smarthr.design/products/components/form-control/)  
> 26. Fieldset | コンポーネント \- SmartHR Design System, [https://smarthr.design/products/components/fieldset/](https://smarthr.design/products/components/fieldset/)  
> 27. HTMLで簡単に実現！郵便番号から住所を自動入力する方法5選, [https://jp-seemore.com/web/2888/](https://jp-seemore.com/web/2888/)  
> 28. Making API calls a seamless user experience \- Allegro Tech Blog, [https://blog.allegro.tech/2021/07/making-api-calls-seamless-ux.html](https://blog.allegro.tech/2021/07/making-api-calls-seamless-ux.html)  
> 29. Eliminating Loading Indicators: The Architecture of Optimistic User, [https://medium.com/@aumaidkh/eliminating-loading-indicators-the-architecture-of-optimistic-user-interfaces-bcbca58502a9](https://medium.com/@aumaidkh/eliminating-loading-indicators-the-architecture-of-optimistic-user-interfaces-bcbca58502a9)  
> 30. Pattern 3: Core Interaction Loops \- UX Patterns for Nostr Apps, [https://nostr-ux.com/docs/patterns/03-core-interactions/](https://nostr-ux.com/docs/patterns/03-core-interactions/)  
> 31. Solving eventual consistency in frontend \- LogRocket Blog, [https://blog.logrocket.com/solving-eventual-consistency-frontend/](https://blog.logrocket.com/solving-eventual-consistency-frontend/)  
> 32. Optimistic Updates \- React Patterns \- SkillDB, [https://skilldb.dev/skills/react-patterns-skills/optimistic-updates](https://skilldb.dev/skills/react-patterns-skills/optimistic-updates)  
> 33. React 19 \`useOptimistic\` Deep Dive — Building Instant, Resilient, [https://dev.to/a1guy/react-19-useoptimistic-deep-dive-building-instant-resilient-and-user-friendly-uis-49fp](https://dev.to/a1guy/react-19-useoptimistic-deep-dive-building-instant-resilient-and-user-friendly-uis-49fp)  
> 34. Author page for OpenReplay Team, [https://blog.openreplay.com/authors/openreplay-team/](https://blog.openreplay.com/authors/openreplay-team/)  
> 35. Foreign Keys, Cascades, and Referential Integrity in PostgreSQL: A, [https://www.querystack.tech/post/foreign-keys-cascades-and-referential-integrity-in-postgresql-a-deep-dive-713dcc](https://www.querystack.tech/post/foreign-keys-cascades-and-referential-integrity-in-postgresql-a-deep-dive-713dcc)  
> 36. Foreign Keys vs Performance (Part 3): The CASCADE DELETE Story, [https://medium.com/@thyagodoliveiraperez/foreign-keys-vs-performance-part-3-the-cascade-delete-story-aac5cabd843b](https://medium.com/@thyagodoliveiraperez/foreign-keys-vs-performance-part-3-the-cascade-delete-story-aac5cabd843b)  
> 37. Detect Soft Delete Patterns in PostgreSQL | Postgres Scripts, [https://www.postgresscripts.com/post/detect-soft-delete-patterns-in-postgresql/](https://www.postgresscripts.com/post/detect-soft-delete-patterns-in-postgresql/)  
> 38. Soft deletion with PostgreSQL: but with logic on the database\!, [https://evilmartians.com/chronicles/soft-deletion-with-postgresql-but-with-logic-on-the-database](https://evilmartians.com/chronicles/soft-deletion-with-postgresql-but-with-logic-on-the-database)  
> 39. How to Implement Soft Deletes in PostgreSQL \- OneUptime, [https://oneuptime.com/blog/post/2026-01-21-postgresql-soft-deletes/view](https://oneuptime.com/blog/post/2026-01-21-postgresql-soft-deletes/view)  
> 40. React Summit US 2024 \- The biggest React conference in the US, [https://gitnation.com/events/react-summit-us-2024](https://gitnation.com/events/react-summit-us-2024)  
> 41. react \- Yarn Classic, [https://classic.yarnpkg.com/en/package/react](https://classic.yarnpkg.com/en/package/react)  
> 42. 100 Essential React Interview Questions in 2026 \- GitHub, [https://github.com/Devinterview-io/react-interview-questions](https://github.com/Devinterview-io/react-interview-questions)  
> 43. React 19's Engine: A Quick Dive into Concurrent Rendering \- Medium, [https://medium.com/@ignatovich.dm/react-19s-engine-a-quick-dive-into-concurrent-rendering-6436d39efe2b](https://medium.com/@ignatovich.dm/react-19s-engine-a-quick-dive-into-concurrent-rendering-6436d39efe2b)  
> 44. useOptimistic \- React, [https://react.dev/reference/react/useOptimistic](https://react.dev/reference/react/useOptimistic)  
> 45. React Basics \- GitHub Pages, [https://learning-zone.github.io/react-basics/](https://learning-zone.github.io/react-basics/)  
> 46. React 19's useOptimistic hook causes re-render of an entire array, [https://stackoverflow.com/questions/78582180/react-19s-useoptimistic-hook-causes-re-render-of-an-entire-array](https://stackoverflow.com/questions/78582180/react-19s-useoptimistic-hook-causes-re-render-of-an-entire-array)  
> 47. Understanding Reconciliation in React 19 & 19.2 \- Souvik Sen, [https://yourstruggle11.medium.com/understanding-reconciliation-in-react-19-19-2-a-deep-dive-into-modern-ui-rendering-ed433ce1e375](https://yourstruggle11.medium.com/understanding-reconciliation-in-react-19-19-2-a-deep-dive-into-modern-ui-rendering-ed433ce1e375)  
> 48. Tailwind CSS v4.0, [https://tailwindcss.com/blog/tailwindcss-v4](https://tailwindcss.com/blog/tailwindcss-v4)  
> 49. Tailwind CSS v4 in Practice: CSS-First Config, What It Costs, and a, [https://nowaterprogramming.com/blog/mastering-tailwind-css](https://nowaterprogramming.com/blog/mastering-tailwind-css)  
> 50. Tailwind CSS v4 with Vue 3: Setup, Config, and Migration Guide, [https://vueschool.io/articles/vuejs-tutorials/master-tailwindcss-4-for-vue/](https://vueschool.io/articles/vuejs-tutorials/master-tailwindcss-4-for-vue/)  
> 51. Frontend Handbook | React / Tailwind / Best practices \- Infinum, [https://infinum.com/handbook/frontend/react/tailwind/best-practices](https://infinum.com/handbook/frontend/react/tailwind/best-practices)  
> 52. Tailwind CSS v4: Underrated Features That Will Transform Your, [https://medium.com/@contato.blense/tailwind-css-v4-underrated-features-that-will-transform-your-workflow-43f5814a49c4](https://medium.com/@contato.blense/tailwind-css-v4-underrated-features-that-will-transform-your-workflow-43f5814a49c4)  
> 53. Tailwind CSS v4 の新しい機能いろいろ \- Zenn, [https://zenn.dev/h\_yokoyama/articles/taiwlindcss4](https://zenn.dev/h_yokoyama/articles/taiwlindcss4)  
> 54. Responsive Grid with Tailwind Queries \- Zignuts Technolab, [https://zignuts.com/question-and-answer/how-do-you-create-a-responsive-grid-layout-using-tailwind-css-container-queries-with-minimal-code](https://zignuts.com/question-and-answer/how-do-you-create-a-responsive-grid-layout-using-tailwind-css-container-queries-with-minimal-code)  
> 55. insert or update on table violates foreign key constraint, [https://stackoverflow.com/questions/2444899/insert-or-update-on-table-violates-foreign-key-constraint](https://stackoverflow.com/questions/2444899/insert-or-update-on-table-violates-foreign-key-constraint)  
> 56. Error Codes | Supabase Docs, [https://supabase.com/docs/guides/api/rest/postgrest-error-codes](https://supabase.com/docs/guides/api/rest/postgrest-error-codes)  
> 57. NpgsqlRest vs PostgREST vs Supabase: Complete Feature, [https://npgsqlrest.github.io/blog/npgsqlrest-vs-postgrest-supabase-comparison.html](https://npgsqlrest.github.io/blog/npgsqlrest-vs-postgrest-supabase-comparison.html)  
> 58. Row Level Security | Supabase Docs, [https://supabase.com/docs/guides/database/postgres/row-level-security](https://supabase.com/docs/guides/database/postgres/row-level-security)  
> 59. Row-Level Security in Supabase: Multi-Tenant SaaS from Day One, [https://dev.to/issuecapture/row-level-security-in-supabase-multi-tenant-saas-from-day-one-4lon](https://dev.to/issuecapture/row-level-security-in-supabase-multi-tenant-saas-from-day-one-4lon)  
> 60. Troubleshooting | Database API 42501 errors \- Supabase Docs, [https://supabase.com/docs/guides/troubleshooting/database-api-42501-errors](https://supabase.com/docs/guides/troubleshooting/database-api-42501-errors)  
> 61. Fix RLS Blocked Insert in Supabase | RapidDev, [https://www.rapidevelopers.com/ai-build-errors/row-level-security-policy-blocked-insert](https://www.rapidevelopers.com/ai-build-errors/row-level-security-policy-blocked-insert)  
> 62. 403 Forbidden: 'new row violates row-level security policy' on upload, [https://supabase.com/docs/guides/troubleshooting/storage-error-403-forbidden-new-row-violates-row-level-security-policy-on-upload-a94384](https://supabase.com/docs/guides/troubleshooting/storage-error-403-forbidden-new-row-violates-row-level-security-policy-on-upload-a94384)  
> 63. supabase-js insert fails with 42501 only when chaining .select(), [https://agents.stackoverflow.com/tils/0644d823-1c0d-4302-b6fc-27eb15746f0f](https://agents.stackoverflow.com/tils/0644d823-1c0d-4302-b6fc-27eb15746f0f)  
> 64. Optimize RLS Policies for Performance \- Postgres Best Practice, [https://supaexplorer.com/best-practices/supabase-postgres/security-rls-performance/](https://supaexplorer.com/best-practices/supabase-postgres/security-rls-performance/)  
> 65. massive performance issues with Supabase (cloud \- Reddit, [https://www.reddit.com/r/Supabase/comments/16ax6f4/massive\_performance\_issues\_with\_supabase\_cloud/](https://www.reddit.com/r/Supabase/comments/16ax6f4/massive_performance_issues_with_supabase_cloud/)  
> 66. Row Level Security \- Procurement Calendar, [https://alejandromartinezg-app\_compras.mintlify.app/database/security](https://alejandromartinezg-app_compras.mintlify.app/database/security)  
> 67. Row level security on select statement to select multiple rows from, [https://stackoverflow.com/questions/78361543/row-level-security-on-select-statement-to-select-multiple-rows-from-two-tables](https://stackoverflow.com/questions/78361543/row-level-security-on-select-statement-to-select-multiple-rows-from-two-tables)  
> 68. Documentation Driven Development v2, [http://www.documentationfirst.ai/](http://www.documentationfirst.ai/)  
> 69. Vibe Coding Best Practices for Everyday Development (In my point, [https://dashankadesilva.medium.com/vibe-coding-best-practices-for-everyday-development-09365f057e49](https://dashankadesilva.medium.com/vibe-coding-best-practices-for-everyday-development-09365f057e49)  
> 70. Adopting Kiro for Spec-Driven Development on a Multi-Repo, [https://community.ibm.com/community/user/blogs/sayan-nandi/2026/05/15/adopting-kiro-for-spec-driven-development-on-a-mul](https://community.ibm.com/community/user/blogs/sayan-nandi/2026/05/15/adopting-kiro-for-spec-driven-development-on-a-mul)  
> 71. DeveloPassion's Newsletter \#212 \- Obsidian Starter Kit v4 Is Live, [https://www.dsebastien.net/developassions-newsletter-212-obsidian-starter-kit-v4-is-live/](https://www.dsebastien.net/developassions-newsletter-212-obsidian-starter-kit-v4-is-live/)  
> 72. Architecture Decision Records: Templates and Operational Patterns, [https://hidekazu-konishi.com/entry/architecture\_decision\_records\_templates\_and\_operations.html](https://hidekazu-konishi.com/entry/architecture_decision_records_templates_and_operations.html)  
> 73. architecture-decision-records.md \- GitHub, [https://github.com/Alexey-Popov/awesome-ai-architect/blob/main/solution-architecture/architecture-decision-records.md](https://github.com/Alexey-Popov/awesome-ai-architect/blob/main/solution-architecture/architecture-decision-records.md)  
> 74. Building a Senior Staff Engineer Agent with Claude Code \- GitHub, [https://github.com/FareedKhan-dev/claude-code-staff-engineer](https://github.com/FareedKhan-dev/claude-code-staff-engineer)