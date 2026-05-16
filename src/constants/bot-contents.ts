type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    BOT_BUILDER: 1,
    CHART: 2,
    TUTORIAL: 3,
    EASY_TOOL: 4,
    FREE_BOTS: 5,
    SIGNALS: 6,
    SIGNAL_CENTRE: 7,
    SMART_TOOLS: 8,
    MARKETKILLER: 9,
    OVER_UNDER: 10,
    RISM_MANAGEMENT: 11,
    MULTI_TRADER: 12,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = [
    'id-dbot-dashboard',
    'id-bot-builder',
    'id-charts',
    'id-tutorials',
    'id-easy-tool',
    'id-free-bots',
    'id-signals',
    'id-signal-centre',
    'id-smart-tools',
    'id-marketkiller',
    'id-over-under',
    'id-risk-management',
    'id-multi-trader',
];

export const DEBOUNCE_INTERVAL_TIME = 500;
