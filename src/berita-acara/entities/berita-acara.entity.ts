import { BeritaAcara } from "@prisma/client";
import { Exclude, Expose } from "class-transformer";

export class BeritaAcaraEntity implements BeritaAcara {
    constructor(partial: Partial<BeritaAcaraEntity>) {
        Object.assign(this, partial);
    }

    @Expose()
    id_berita_acara: number;

    @Expose()
    id_vendor: number;

    @Expose()
    path_file: string | null;

    @Expose()
    job_order_ids: number | null;

    @Expose()
    job_order_report_ids: number | null;

    @Expose()
    tgl_submit: Date | null;

    @Expose()
    note: string | null;

    @Expose()
    status: string;

    @Expose()
    subject: string | null;

    @Exclude()
    created_by: number | null;

    @Exclude()
    updated_by: number | null;

    @Exclude()
    created_at: Date;

    @Exclude()
    updated_at: Date;

    @Exclude()
    deleted_at: Date | null;
}