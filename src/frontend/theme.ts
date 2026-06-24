import { theme } from "antd";
import type { ThemeConfig } from "antd";
import React from "react";

const baseToken = {
    borderRadius: 10,
    borderRadiusLG: 14,
    borderRadiusSM: 8,
    fontSize: 14,
    controlHeight: 38,
    controlHeightLG: 44,
    wireframe: false,
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
};

export const lightTheme: ThemeConfig = {
    algorithm: theme.defaultAlgorithm,
    token: {
        ...baseToken,
        colorPrimary: '#4f46e5',
        colorInfo: '#4f46e5',
        colorLink: '#4f46e5',
        colorSuccess: '#16a34a',
        colorWarning: '#d97706',
        colorError: '#dc2626',
    },
    components: {
        Card: {
            headerBg: 'transparent',
            headerFontSize: 16,
            paddingLG: 24,
        },
        Steps: {
            colorPrimary: '#4f46e5',
        },
        Button: {
            controlHeight: 38,
            fontWeight: 500,
        },
        Form: {
            itemMarginBottom: 20,
        },
        Table: {
            headerBg: '#f7f8fc',
            headerColor: '#4b5563',
            rowHoverBg: '#e8eafd',
        },
    },
};

export const darkTheme: ThemeConfig = {
    algorithm: theme.darkAlgorithm,
    token: {
        ...baseToken,
        colorPrimary: '#818cf8',
        colorInfo: '#818cf8',
        colorLink: '#818cf8',
        colorSuccess: '#4ade80',
        colorWarning: '#fbbf24',
        colorError: '#f87171',
        colorBgLayout: '#20242f',
        colorBgContainer: '#2a2f3d',
        colorBgElevated: '#313747',
        colorBorder: '#3a4051',
        colorBorderSecondary: '#343a4a',
        colorText: '#e8eaf0',
        colorTextSecondary: '#a8aec0',
    },
    components: {
        Card: {
            headerBg: 'transparent',
            headerFontSize: 16,
            paddingLG: 24,
            colorBgContainer: '#2a2f3d',
        },
        Steps: {
            colorPrimary: '#818cf8',
        },
        Button: {
            controlHeight: 38,
            fontWeight: 500,
        },
        Form: {
            itemMarginBottom: 20,
        },
        Table: {
            headerBg: '#313747',
            headerColor: '#a8aec0',
            rowHoverBg: '#3d4456',
            colorBgContainer: '#2a2f3d',
        },
    },
};

export const useSystemDarkMode = (): boolean => {
    const [dark, setDark] = React.useState<boolean>(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return false;
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    });

    React.useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) return;
        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e: MediaQueryListEvent) => setDark(e.matches);
        mql.addEventListener('change', handler);
        return () => mql.removeEventListener('change', handler);
    }, []);

    return dark;
};
