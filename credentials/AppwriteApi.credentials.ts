import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AppwriteApi implements ICredentialType {
	name = 'appwriteApi';
	displayName = 'Appwrite API';
	documentationUrl = 'https://appwrite.io/docs';
	properties: INodeProperties[] = [
		{
			displayName: 'API Endpoint',
			name: 'apiEndpoint',
			type: 'string',
			default: 'https://cloud.appwrite.io/v1',
			placeholder: 'https://cloud.appwrite.io/v1',
			description: 'The Appwrite API endpoint URL',
		},
		{
			displayName: 'Project ID',
			name: 'projectId',
			type: 'string',
			default: '',
			placeholder: '5f9a8b7c6d5e4f3g2h1i0j9k',
			description: 'Your Appwrite Project ID',
		},
		{
			displayName: 'Database ID',
			name: 'databaseId',
			type: 'string',
			default: '',
			placeholder: 'my-database-id',
			description: 'Your Appwrite Database ID',
		},
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			description: 'Your Appwrite API Key',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				'X-Appwrite-Project': '={{$credentials.projectId}}',
				'X-Appwrite-Key': '={{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: '={{$credentials.apiEndpoint}}',
			url: '/health',
		},
	};
}
