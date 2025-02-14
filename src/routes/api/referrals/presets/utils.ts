import { presetsToLanguages, presetsToServices, referralLanguages, referralServices } from "$lib/server/db/schema"

export const relationships = [
    {
        junctionTable: presetsToLanguages,
        mainTable: referralLanguages,
        bodyName: "languages"
    },
    {
        junctionTable: presetsToServices,
        mainTable: referralServices,
        bodyName: "services"
    }
] as const
