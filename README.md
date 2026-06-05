# 招投标保证金退还管理系统

全栈 Web 应用，管理招投标流程中的保证金缴纳、中标结果确认、退还申请审批及付款凭证归档。

## 功能模块

- **项目标段管理** — 创建和管理项目标段，跟踪开标/定标/签约状态
- **保证金流水** — 录入投标方保证金缴纳记录
- **中标结果** — 录入中标人信息，跟踪合同签约状态
- **退还申请** — 发起保证金退还，系统自动校验业务规则
- **付款凭证** — 对已审批退还登记付款凭证

## 业务规则

1. **未开标项目不能退还** — 标段状态为"未开标"时，任何保证金不可发起退还
2. **中标人未签合同不能退保证金** — 已定标但中标人未签合同时，中标人的保证金不可退还

## 技术栈

- 前端：React 18 + TypeScript + Tailwind CSS + Vite + Zustand
- 后端：Express 4 + TypeScript
- 数据库：SQLite (sql.js)

## 本地开发

```bash
npm install
npm run dev
```

前端 http://localhost:5173，后端 API http://localhost:3001

## Docker 部署

```bash
docker compose up --build
```

应用启动在 http://localhost:3000

## 冒烟测试

```bash
bash scripts/smoke.sh
```

验证核心业务规则：对未开标标段发起退还并确认系统拒绝。
