import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  CreateDateColumn,
  Unique,
  ManyToOne,
} from 'typeorm';

import ProcessStatus from '../../../enums/process-status.enum';

import CandidateToOffer from '../candidate-to-offer.entity';

@Entity()
class ProcessArchive {
  @PrimaryGeneratedColumn()
  public id: string;

  @ManyToOne((type) => CandidateToOffer, (candidateToOffer) => candidateToOffer.archives)
  public process: CandidateToOffer;

  @Column({ enum: ProcessStatus })
  public status: string;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}

export default ProcessArchive;
