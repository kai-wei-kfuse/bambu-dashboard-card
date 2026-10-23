# Distribution and community discovery

## Public milestone

[v0.1.0](https://github.com/kai-wei-kfuse/bambu-dashboard-card/releases/tag/v0.1.0) is the first public milestone, published for early use and feedback. The release includes the single JavaScript module, complete dashboard YAML and SHA256 checksums. Remaining hardware/model/installation checks are tracked in [current status](current-status.md) and [follow-ups](stage-follow-ups.md).

## HACS availability

Users can install now by adding `https://github.com/kai-wei-kfuse/bambu-dashboard-card` as a **Dashboard** custom repository, or opening the [HACS repository link](https://my.home-assistant.io/redirect/hacs_repository/?owner=kai-wei-kfuse&repository=bambu-dashboard-card&category=plugin). This requires HA and HACS in their own installation.

A custom repository becomes available to the user who adds it. It does not make the project globally searchable in HACS. Global discovery requires an accepted pull request adding `kai-wei-kfuse/bambu-dashboard-card` alphabetically to the `plugin` file in [hacs/default](https://github.com/hacs/default). After merging, HACS includes the repository in its next scheduled scan. Review timing is controlled by HACS; its current documentation describes a backlog of months, not an immediate listing.

The owner or a major contributor must submit the application. Prepare a branch from the upstream default repository's `master`, use its current PR template and allow maintainer edits. The application must accurately report validation; no submission or approval is claimed by this document.

Readiness at this milestone:

- Public GitHub repository with description, topics, issues, MIT license, bilingual README and synthetic screenshots.
- Dashboard module filename matches the repository; `hacs.json` names the module.
- GitHub HACS Action runs as `category: plugin`, with no validation ignores. Hassfest and integration brand icons apply to backend integrations, not this dashboard plugin.
- A full GitHub Release with downloadable module is required; a tag alone is insufficient.
- Clean HACS installation remains an explicit verification task before claiming that acceptance test passed.

Official references: [general requirements](https://www.hacs.xyz/docs/publish/start/), [dashboard plugin structure](https://www.hacs.xyz/docs/publish/plugin/), [default inclusion](https://www.hacs.xyz/docs/publish/include/), [custom repositories](https://www.hacs.xyz/docs/faq/custom_repositories/). My-link parameters are defined in the official [redirect manifest](https://github.com/home-assistant/my.home-assistant.io/blob/main/redirect.json).

## Promotion

Start with a post in the [Home Assistant Community](https://community.home-assistant.io/) sharing/projects area, then a Bambu community post aimed at people already using HA. Lead with screenshots, multi-printer layouts, the dependency on ha-bambulab, a direct release link and the custom-repository installation link. Ask early users to report HA/integration versions, printer model, browser and reproducible steps through GitHub issues.

The screenshots in this repository use labeled synthetic data. Do not publish real household cameras, device identifiers, LAN addresses, credentials or notification destinations. Announce broader model support only after it has been tested.

Suggested announcement title:

> Bambu Dashboard Card v0.1.0 — a customizable multi-printer workspace for Home Assistant

Suggested English announcement:

> I released the first public milestone of Bambu Dashboard Card, an HA-native dashboard built on ha-bambulab. It includes a multi-printer overview, draggable/hideable/wide detail cards, external HA camera selection, AMS/spool views, diagnostic alerts, interactive temperature history, cached-project tools and backend completion reminders. Installation currently uses a HACS custom repository. UI/data checks cover two A1 printers and AMS Lite; physical controls, external camera hardware, broader models and clean HACS installation still need testing. Feedback and reproducible issues are welcome.

Suggested Chinese announcement:

> 发布一个基于 ha-bambulab 的 Home Assistant 拓竹打印工作台 v0.1.0，支持多机总览、整块拖动与显隐/折叠/宽卡、外接 HA 摄像头、AMS/外挂料盘、告警、交互温度历史、缓存文件和后台完成提醒。目前通过 HACS 自定义仓库安装。已验证两台 A1 与 AMS Lite 的界面和数据；实体控制、真实外接摄像头、更多机型和全新 HACS 安装仍待验收，欢迎试用反馈。

These are ready-to-use drafts; community posting and HACS default-list submission are separate publication actions.
