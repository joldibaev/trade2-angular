import { Injectable } from '@angular/core';
import { _baseCrudService } from './_base-crud.service';
import { User, CreateUserDto, UpdateUserDto } from '../../shared/entities/user.interface';

/**
 * User service for managing user entities
 */
@Injectable({
  providedIn: 'root',
})
export class UserService extends _baseCrudService<User, CreateUserDto, UpdateUserDto> {
  constructor() {
    super('users');
  }
}
