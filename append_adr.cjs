const fs = require('fs');
let c = fs.readFileSync('governance/ADR/012-orphan-data-handling-ux.md', 'utf8');

c += \\n\n## Update (Phase 2): Logical Deletion Migration\nユーザー提案に基づき、物理削除から論理削除(isDeleted)へ移行しました。これにより、顧客データの履歴が保持され、過去のスケジュールやテンプレートの復元が可能になりました。\n\
fs.writeFileSync('governance/ADR/012-orphan-data-handling-ux.md', c);
