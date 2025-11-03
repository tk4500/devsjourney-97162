import { TestBed } from '@angular/core/testing';

import { CustomBlockService } from './custom-block.service';

describe('CustomBlockService', () => {
  let service: CustomBlockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomBlockService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
