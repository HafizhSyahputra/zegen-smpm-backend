import { Test, TestingModule } from '@nestjs/testing';
import { PreventiveMaintenanceReportController } from './preventive-maintenance-report.controller';

describe('PreventiveMaintenanceReportController', () => {
  let controller: PreventiveMaintenanceReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PreventiveMaintenanceReportController],
    }).compile();

    controller = module.get<PreventiveMaintenanceReportController>(PreventiveMaintenanceReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
