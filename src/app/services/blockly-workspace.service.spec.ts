import { TestBed } from '@angular/core/testing';

import { BlocklyWorkspaceService } from './blockly-workspace.service';

describe('BlocklyWorkspaceService', () => {
  let service: BlocklyWorkspaceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BlocklyWorkspaceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
