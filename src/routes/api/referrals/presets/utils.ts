import {
    presetsToAreasCovered,
    presetsToLanguages,
    presetsToServices,
    referralAreaCovered,
    referralLanguages,
    referralServices
} from "$lib/server/db/schema"

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
    },
    {
        junctionTable: presetsToAreasCovered,
        mainTable: referralAreaCovered,
        bodyName: "areasCovered"
    }
] as const
