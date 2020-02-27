import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
class Qy {
  @PrimaryGeneratedColumn() id: number;
}

export { Qy };
