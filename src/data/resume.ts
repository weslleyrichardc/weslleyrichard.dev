export const profile =
	"I'm a Software Engineer with a product mindset, focused on solutions that go beyond code to address real business needs. My experience spans agile startups and enterprise environments. I specialize in architecting scalable microservices with PHP (Laravel, Symfony), AWS, and Docker, and I actively mentor teams so projects move seamlessly from concept to execution."

export const availability =
	'Open to remote full-stack/backend roles (PHP/Laravel preferred) and freelance, consulting, and part-time welcome.'

export interface Experience {
	title: string
	company: string
	companyUrl: string
	period: string
	employmentType?: string
	description: string
}

export const experience: Array<Experience> = [
	{
		title: 'PHP Backend Software Engineer',
		company: 'Printi',
		companyUrl: 'https://www.printi.com.br',
		period: 'Apr 2023 – Jul 2025',
		employmentType: 'Full-time',
		description:
			'Built scalable microservices with Symfony and AWS (SNS, SQS, Lambda); coordinated sprints and mentored developers, working with teams across India and Romania.'
	},
	{
		title: 'PHP Backend Software Engineer',
		company: 'Brasil TecPar (Datum TI)',
		companyUrl: 'https://www.brasiltecpar.com.br/',
		period: 'Sep 2022 – Apr 2023',
		employmentType: 'Full-time',
		description:
			'Maintained critical integrations with Symfony, Oracle DB and RabbitMQ; expanded the platform for product integrations.'
	},
	{
		title: 'Full Stack Software Engineer',
		company: 'Cloudfox',
		companyUrl: 'https://cloudfox.net/',
		period: 'Apr 2021 – Jun 2022',
		employmentType: 'Contract',
		description:
			'Co-developed an anti-fraud system that cut fraud and chargebacks by ~60%; built a real-time decision dashboard with Alpine.js.'
	},
	{
		title: 'Full Stack Software Engineer',
		company: 'KBR TEC',
		companyUrl: 'https://www.kbrtec.com.br',
		period: 'Oct 2019 – Mar 2021',
		employmentType: 'Internship',
		description:
			'Built scheduling tools and internal management systems that centralized project tracking; delivered backends for client sites.'
	}
]

export const education: Array<{ school: string; degree: string; period: string }> = [
	{
		school: 'ETEC Adolpho Berezin (Centro Paula Souza)',
		degree: 'Computer Technician',
		period: 'Jul 2011 – Dec 2012'
	}
]

export const skills: Array<{ category: string; skills: string }> = [
	{
		category: 'Backend',
		skills: 'PHP (Laravel, Symfony), Doctrine ORM, REST APIs, microservices, Node.js, Go, Python'
	},
	{
		category: 'Frontend',
		skills: 'JavaScript (React, Vue, Alpine.js, Next.js), Tailwind CSS'
	},
	{
		category: 'Cloud & Infrastructure',
		skills: 'AWS (SNS, SQS, EC2, Lambda, S3), Docker, Docker Compose'
	},
	{
		category: 'Messaging & Queuing',
		skills: 'RabbitMQ, Kafka'
	},
	{
		category: 'Databases',
		skills: 'MySQL, PostgreSQL, Oracle DB, MongoDB, Redis'
	},
	{
		category: 'Integrations',
		skills: 'CRM (HubSpot), Payment (PagSeguro, Stripe, Adyen, Asaas)'
	},
	{
		category: 'Quality & DevOps',
		skills: 'PHPUnit, SonarQube, Jenkins, CI/CD, SOLID principles'
	}
]
