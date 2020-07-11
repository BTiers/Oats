import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
  CreateDateColumn,
  BeforeInsert,
  Unique,
  RelationCount,
} from 'typeorm';
import slugify from 'slugify';

import User from '../user/user.entity';
import Client from '../client/client.entity';
import CandidateToOffer from '../candidate/offer/candidate-to-offer.entity';

import Contract from '../shared/enums/contract.enum';

@Entity()
@Unique(['slug'])
class Offer {
  @PrimaryGeneratedColumn()
  public id: string;

  @Column()
  public job: string;

  @Column()
  public slug: string;

  @BeforeInsert()
  generateSlug() {
    this.slug = slugify(`${this.owner.name}-${this.job}`, { lower: true });
  }

  @Column()
  public annualSalary: number;

  @Column({
    enum: Contract,
    default: Contract.Permanent,
  })
  public contractType: string;

  @ManyToOne(() => User, (owner: User) => owner.offers)
  public referrer: User;

  @ManyToOne(() => Client, (owner: Client) => owner.offers)
  public owner: Client;

  @OneToMany(() => CandidateToOffer, (candidateToOffer) => candidateToOffer.offer)
  public candidates!: CandidateToOffer[];

  @RelationCount((offer: Offer) => offer.candidates)
  public processCount: number;

  @Column("tsvector", { select: false })
  documentWithWeights: any;

  @CreateDateColumn()
  createdDate: Date;

  @UpdateDateColumn()
  updatedDate: Date;
}

export default Offer;
