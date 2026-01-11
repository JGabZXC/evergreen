import {apiPrivate} from "../../../config/axiosPrivate.ts";

export const getMySections = async (schoolYear: string) => {
    let url = "/api/teacher/my-sections";
    if (schoolYear && schoolYear !== "all") {
        url += `?schoolYear=${schoolYear}`;
    }

    const {data} = await apiPrivate.get(url);
    return data.sections;
}