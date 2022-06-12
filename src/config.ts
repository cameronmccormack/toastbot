import 'dotenv/config';

const getString = (key: string): string => {
    const value = process.env[key];
    if (!value) throw new Error(`Missing environment variable: ${key}.`);
    return value;
};

const getOptionalString = (key: string): string | undefined => {
    return process.env[key];
};

const getOptionalCommaSeparatedList = (key: string): string[] => {
    const rawList = getOptionalString(key);
    if (!rawList) return [];
    return rawList.trim().split(',').filter(x => !!x);
};

const getFeatureToggle = (key: string): boolean => {
    return getOptionalString(key)?.trim()?.toLowerCase() === 'true';
};

export const config = {
    port: getOptionalString('PORT') || 3000,
    slackToken: getString('SLACK_TOKEN'),
    slackVerificationToken: getString('SLACK_VERIFICATION_TOKEN'),
    toastChannelId: getString('TOAST_CHANNEL_ID'),
    ownerId: getString('OWNER_ID'),
    maintenanceModeActive: getFeatureToggle('MAINTENANCE_MODE'),
    maintenanceBypassUserIds: getOptionalCommaSeparatedList('MAINTENANCE_BYPASS_USER_IDS'),
};
