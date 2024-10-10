import { Test, TestingModule } from '@nestjs/testing';
import { PreventiveMaintenanceReportService } from './preventive-maintenance-report.service';

describe('PreventiveMaintenanceReportService', () => {
  let service: PreventiveMaintenanceReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PreventiveMaintenanceReportService],
    }).compile();

    service = module.get<PreventiveMaintenanceReportService>(PreventiveMaintenanceReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
