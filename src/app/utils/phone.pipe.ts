import { Pipe } from "@angular/core";

@Pipe({
    name: "phone"
})
export class PhonePipe {
    transform(rawNum: string) {
        let areaCodeStr = "";
        let midSectionStr = "";
        let lastSectionStr = "";

        if (rawNum.startsWith("33") || rawNum.startsWith("55") || rawNum.startsWith("81")) {
            areaCodeStr = rawNum.slice(0, 2);
            midSectionStr = rawNum.slice(2, 6);
            lastSectionStr = rawNum.slice(6);
        } else {
            areaCodeStr = rawNum.slice(0, 3);
            midSectionStr = rawNum.slice(3, 6);
            lastSectionStr = rawNum.slice(6);
        }

        return `(${areaCodeStr}) ${midSectionStr}-${lastSectionStr}`;
    }
}