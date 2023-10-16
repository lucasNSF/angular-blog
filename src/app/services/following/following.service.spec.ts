/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { FollowingService } from './following.service';

describe('Service: Following', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FollowingService]
    });
  });

  it('should ...', inject([FollowingService], (service: FollowingService) => {
    expect(service).toBeTruthy();
  }));
});
