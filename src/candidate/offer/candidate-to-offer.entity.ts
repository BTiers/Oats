import {
  Entity,
  Column,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';

import ProcessStatus from '../../enums/process-status.enum';

import Candidate from '../candidate.entity';
import Offer from '../../offer/offer.entity';
import ProcessArchive from './archive/process-archive.entity';

@Entity()
class CandidateToOffer {
  @PrimaryGeneratedColumn()
  public id!: number;

  @Column()
  public candidateId!: number;

  @Column()
  public offerId!: number;

  @Column({
    enum: ProcessStatus,
  })
  public status!: string;

  @OneToMany(() => ProcessArchive, (processArchive) => processArchive.process)
  public archives!: ProcessArchive[];

  @ManyToOne(() => Candidate, (candidate) => candidate.processes)
  public candidate!: Candidate;

  @ManyToOne(() => Offer, (offer) => offer.candidates)
  public offer!: Offer;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}

export default CandidateToOffer;
