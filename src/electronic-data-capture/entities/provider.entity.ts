import { ProviderSimcard } from "@prisma/client";
import { Exclude, Expose } from "class-transformer";

export class ProviderEntity implements ProviderSimcard {
    @Expose()
    id_provider_simcard: number;

    @Expose()
    name_provider: string;

    @Exclude()
    created_by: number;
    @Exclude()
    updated_by: number;
    @Exclude()
    created_at: Date;
    @Exclude()
    updated_at: Date;
    @Exclude()
    deleted_at: Date;
    
}