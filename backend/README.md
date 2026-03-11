# 符文大师 · 神谕引擎 API（v5）

- **24 符**：古弗薩克完整数据见 `runes_data.py`
- **v5 融合**：规则脑 + AI 脑，风格 traditional / balanced / spiritual
- **智谱 GLM**：配置 `ZHIPU_API_KEY` 后自动用 GLM-4 生成灵性解读，未配置则用规则扩写（Stub）

## 环境变量

| 变量 | 说明 |
|------|------|
| `ZHIPU_API_KEY` 或 `RUNE_GLM_API_KEY` | 智谱开放平台 API Key，用于 v5 灵性解读；不设则仅规则解读 |

## 启动

```bash
pip install -r requirements.txt
# 可选：export ZHIPU_API_KEY=你的智谱Key
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

- 文档：http://localhost:8000/docs
- v5 解读：`POST /api/v5/reading`，可传 `drawn_runes`、`style`
- 前端联调：项目根 `.env` 增加 `VITE_RUNES_API_URL=http://localhost:8000`
