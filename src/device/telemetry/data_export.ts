import { IDeviceAttributes } from "../device";

import xml2js from "xml2js";

import json2csv from "json2csv";

export function to_json(data: IDeviceAttributes[]) {
    return data.map((dev) => {
        return {
            id: dev.id,
            name: dev.name,

            attributes: dev.attributes.map((a) => {
                return {
                    id: a.id,
                    name: a.name,
                    type: a.type,

                    telemetry: a.telemetry?.map((t) => {
                        return {
                            createdAt: t.createdAt?.toISOString(),
                            value: t.value,
                        };
                    }),
                };
            }),
        };
    });
}

export function to_xml(data: IDeviceAttributes[]) {
    const builder = new xml2js.Builder();
    const parsed = {
        Devices: {
            Device: data.map((dev) => {
                return {
                    $: {
                        id: dev.id,
                        name: dev.name,
                    },
                    attributes: dev.attributes.map((a) => {
                        return {
                            $: {
                                id: a.id,
                                name: a.name,
                                type: a.type,
                            },

                            telemetry: a.telemetry?.map((t) => {
                                return {
                                    $: {
                                        createdAt: t.createdAt?.toISOString(),
                                        value: t.value,
                                    },
                                };
                            }),
                        };
                    }),
                };
            }),
        },
    };

    const xml = builder.buildObject(parsed);
    return xml;
}

export function to_csv(data: IDeviceAttributes[]) {
    const parsed = [];
    const fields = ["dev_id", "dev_name", "attr_id", "attr_name", "attr_type", "telemetry_createdAt", "telemetry_value"];

    for(const d of data){
        for(const a of d.attributes){
            for(const t of a.telemetry || []){
                parsed.push({
                    dev_id: d.id,
                    dev_name: d.name,
                    attr_id: a.id,
                    attr_name: a.name,
                    attr_type: a.type,
                    telemetry_createdAt: t.createdAt?.toISOString() || "null",
                    telemetry_value: String(t.value || "null")
                })
            }
        }
    }
    
    return json2csv.parse(parsed, {fields});

}
