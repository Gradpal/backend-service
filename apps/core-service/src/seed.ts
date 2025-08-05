import { DataSource } from 'typeorm';
import { UNIVERSITY_DOMAINS } from '../src/common/constants/data.constants';
import { University } from '../src/modules/university/entities/university.entity';

export const seedUniversities = async (dataSource: DataSource) => {
  const universityRepository = dataSource.getRepository(University);

  await universityRepository.clear();

  const universities = UNIVERSITY_DOMAINS.map((uni) => {
    const university = new University();
    university.universityName = uni.name;
    university.countryName = uni.country || 'Unknown';
    university.universityEmailDomains = uni.domains;
    return university;
  });

  await universityRepository.save(universities);

  console.log(`Successfully seeded ${universities.length} universities`);
};

export const runSeed = async () => {
  const dataSource = new DataSource({
    type: 'postgres',
    host: '209.105.242.202',
    port: 5434,
    username: 'postgres',
    password: '123',
    database: 'gradpal_db',
    entities: [University],
    synchronize: false,
  });

  try {
    await dataSource.initialize();
    await seedUniversities(dataSource);
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await dataSource.destroy();
  }
};

if (require.main === module) {
  runSeed()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}
