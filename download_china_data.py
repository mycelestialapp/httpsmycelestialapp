import requests
import json

def download_china_data():
    # 这里用的是 modood 的中国行政区划 JSON（省 -> 市 -> 区县）
    url = "https://raw.githubusercontent.com/modood/Administrative-divisions-of-China/master/dist/pcas.json"

    print("正在从 GitHub 下载中国省市区详细数据...")
    try:
        resp = requests.get(url, timeout=60)
        resp.raise_for_status()  # 非 200 会抛异常
        data = resp.json()

        # 保存为本地 JSON 文件
        with open("china_regions.json", "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print("下载完成，已保存为 china_regions.json")
        print(f"顶层省级行政区数量：{len(data)} 个（含港澳台）")
    except Exception as e:
        print(f"下载失败或解析错误：{e}")

if __name__ == "__main__":
    download_china_data()