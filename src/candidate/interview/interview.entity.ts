import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';

import Candidate from '../candidate.entity';
import User from '../../user/user.entity';

@Entity()
class Interview {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public comments: string;

  @ManyToOne((type) => Candidate, (candidate) => candidate.interviews)
  public candidate: Candidate;

  @ManyToOne((type) => User, (user) => user.interviews)
  public recruiter: User;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}

export default Interview;
