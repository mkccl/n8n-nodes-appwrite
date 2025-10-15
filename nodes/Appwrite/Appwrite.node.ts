import {
	IExecuteFunctions,
} from 'n8n-core';

import {
	IDataObject,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	NodeOperationError,
} from 'n8n-workflow';

import { Client, Databases, ID, Query } from 'node-appwrite';

export class Appwrite implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Appwrite',
		name: 'appwrite',
		icon: 'file:appwrite.svg',
		group: ['transform'],
		version: 1,
		description: 'Interact with Appwrite API',
		defaults: {
			name: 'Appwrite',
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: 'appwriteApi',
				required: true,
			},
		],
		properties: [
			// Resource
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Document',
						value: 'document',
					},
				],
				default: 'document',
				required: true,
			},

			// Operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				options: [
					{
						name: 'Create',
						value: 'create',
						description: 'Create a document',
						action: 'Create a document',
					},
					{
						name: 'Get',
						value: 'get',
						description: 'Get a document',
						action: 'Get a document',
					},
					{
						name: 'List',
						value: 'list',
						description: 'List documents',
						action: 'List documents',
					},
				],
				default: 'list',
			},

			// Collection ID (required for all operations)
			{
				displayName: 'Collection ID',
				name: 'collectionId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
					},
				},
				default: '',
				placeholder: 'my-collection-ID',
			},

			// Document ID (for get operation)
			{
				displayName: 'Document ID',
				name: 'documentId',
				type: 'string',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['get'],
					},
				},
				default: '',
				placeholder: 'unique-document-ID',
				description: 'The document ID to retrieve',
			},

			// Document ID (for create operation)
			{
				displayName: 'Document ID',
				name: 'documentId',
				type: 'string',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create'],
					},
				},
				default: '',
				placeholder: 'unique-document-ID',
				description: 'Unique document ID. Leave empty to auto-generate.',
			},

			// Document Data (for create operation) - now accepts object from previous node
			{
				displayName: 'Document Data',
				name: 'documentData',
				type: 'json',
				required: true,
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create'],
					},
				},
				default: '={}',
				description: 'The document data as an object. Can reference input data with expressions.',
				placeholder: '={{ $json }}',
			},

			// Permissions (for create operations)
			{
				displayName: 'Permissions',
				name: 'permissions',
				type: 'json',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['create'],
					},
				},
				default: '[]',
				placeholder: '["read(\\"any\\")"]',
				description: 'Document permissions as JSON array. Example: ["read(\"any\")", "write(\"user:USER_ID\")"].',
			},

			// Query Support (for list operation)
			{
				displayName: 'Return All',
				name: 'returnAll',
				type: 'boolean',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['list'],
					},
				},
				default: false,
				description: 'Whether to return all results or only up to a given limit',
			},
			{
				displayName: 'Limit',
				name: 'limit',
				type: 'number',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['list'],
						returnAll: [false],
					},
				},
				typeOptions: {
					minValue: 1,
				},
				default: 50,
				description: 'Max number of results to return',
			},

			// Query Options
			{
				displayName: 'Query Mode',
				name: 'queryMode',
				type: 'options',
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['list'],
					},
				},
				options: [
					{
						name: 'Query Builder',
						value: 'builder',
						description: 'Build queries using the UI',
					},
					{
						name: 'Custom Query',
						value: 'custom',
						description: 'Write custom Appwrite queries',
					},
				],
				default: 'builder',
			},

			// Custom Query Field
			{
				displayName: 'Custom Queries',
				name: 'customQueries',
				type: 'string',
				typeOptions: {
					rows: 5,
				},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['list'],
						queryMode: ['custom'],
					},
				},
				default: '',
				placeholder: 'Query.equal("status", "active")\nQuery.greaterThan("price", 100)',
				description: 'Enter Appwrite Query strings, one per line. See <a href="https://appwrite.io/docs/products/databases/queries" target="_blank">Appwrite Query documentation</a>.',
			},

			// Query Builder
			{
				displayName: 'Queries',
				name: 'queries',
				type: 'fixedCollection',
				typeOptions: {
					multipleValues: true,
				},
				displayOptions: {
					show: {
						resource: ['document'],
						operation: ['list'],
						queryMode: ['builder'],
					},
				},
				default: {},
				description: 'Query filters to apply',
				options: [
					{
						name: 'query',
						displayName: 'Query',
						values: [
							{
								displayName: 'Query Type',
								name: 'queryType',
								type: 'options',
								options: [
									{ name: 'Equal', value: 'equal' },
									{ name: 'Not Equal', value: 'notEqual' },
									{ name: 'Less Than', value: 'lessThan' },
									{ name: 'Less Than or Equal', value: 'lessThanEqual' },
									{ name: 'Greater Than', value: 'greaterThan' },
									{ name: 'Greater Than or Equal', value: 'greaterThanEqual' },
									{ name: 'Search', value: 'search' },
									{ name: 'Is Null', value: 'isNull' },
									{ name: 'Is Not Null', value: 'isNotNull' },
									{ name: 'Between', value: 'between' },
									{ name: 'Starts With', value: 'startsWith' },
									{ name: 'Ends With', value: 'endsWith' },
									{ name: 'Select', value: 'select' },
									{ name: 'Order Ascending', value: 'orderAsc' },
									{ name: 'Order Descending', value: 'orderDesc' },
								],
								default: 'equal',
							},
							{
								displayName: 'Attribute',
								name: 'attribute',
								type: 'string',
								default: '',
								description: 'The attribute to query',
							},
							{
								displayName: 'Value',
								name: 'value',
								type: 'string',
								default: '',
								displayOptions: {
									hide: {
										queryType: ['isNull', 'isNotNull', 'orderAsc', 'orderDesc', 'select'],
									},
								},
								description: 'The value to compare against',
							},
							{
								displayName: 'Attributes to Select',
								name: 'selectAttributes',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										queryType: ['select'],
									},
								},
								placeholder: 'name,email,createdAt',
								description: 'Comma-separated list of attributes to select',
							},
							{
								displayName: 'Start Value',
								name: 'startValue',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										queryType: ['between'],
									},
								},
							},
							{
								displayName: 'End Value',
								name: 'endValue',
								type: 'string',
								default: '',
								displayOptions: {
									show: {
										queryType: ['between'],
									},
								},
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: IDataObject[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;

		// Get credentials
		const credentials = await this.getCredentials('appwriteApi');
		const apiEndpoint = credentials.apiEndpoint as string;
		const projectId = credentials.projectId as string;
		const databaseId = credentials.databaseId as string;
		const apiKey = credentials.apiKey as string;

		// Initialize Appwrite client
		const client = new Client()
			.setEndpoint(apiEndpoint)
			.setProject(projectId)
			.setKey(apiKey);

		const databases = new Databases(client);

		for (let i = 0; i < items.length; i++) {
			try {
				if (resource === 'document') {
					const collectionId = this.getNodeParameter('collectionId', i) as string;

					if (operation === 'get') {
						// Get Document
						const documentId = this.getNodeParameter('documentId', i) as string;
						const document = await databases.getDocument(databaseId, collectionId, documentId);
						returnData.push(document as unknown as IDataObject);

					} else if (operation === 'list') {
						// List Documents
						const returnAll = this.getNodeParameter('returnAll', i) as boolean;
						const queryMode = this.getNodeParameter('queryMode', i) as string;

						const queries: string[] = [];

						if (queryMode === 'custom') {
							// Custom Query Mode
							const customQueries = this.getNodeParameter('customQueries', i, '') as string;
							if (customQueries.trim()) {
								// Parse line by line and evaluate each query
								const queryLines = customQueries.split('\n').filter(line => line.trim());
								for (const line of queryLines) {
									try {
										// Evaluate the query string to get the actual query object
										// This allows users to write: Query.equal("status", "active")
										const queryResult = eval(line.trim());
										queries.push(queryResult);
									} catch (error) {
										throw new NodeOperationError(
											this.getNode(),
											`Invalid query: ${line}. Error: ${(error as Error).message}`,
											{ itemIndex: i }
										);
									}
								}
							}
						} else {
							// Query Builder Mode
							const queryData = this.getNodeParameter('queries', i, {}) as IDataObject;
							if (queryData.query && Array.isArray(queryData.query)) {
								for (const q of queryData.query) {
									const queryType = q.queryType as string;
									const attribute = q.attribute as string;

									switch (queryType) {
										case 'equal':
											queries.push(Query.equal(attribute, q.value));
											break;
										case 'notEqual':
											queries.push(Query.notEqual(attribute, q.value));
											break;
										case 'lessThan':
											queries.push(Query.lessThan(attribute, q.value));
											break;
										case 'lessThanEqual':
											queries.push(Query.lessThanEqual(attribute, q.value));
											break;
										case 'greaterThan':
											queries.push(Query.greaterThan(attribute, q.value));
											break;
										case 'greaterThanEqual':
											queries.push(Query.greaterThanEqual(attribute, q.value));
											break;
										case 'search':
											queries.push(Query.search(attribute, q.value));
											break;
										case 'isNull':
											queries.push(Query.isNull(attribute));
											break;
										case 'isNotNull':
											queries.push(Query.isNotNull(attribute));
											break;
										case 'between':
											queries.push(Query.between(attribute, q.startValue, q.endValue));
											break;
										case 'startsWith':
											queries.push(Query.startsWith(attribute, q.value));
											break;
										case 'endsWith':
											queries.push(Query.endsWith(attribute, q.value));
											break;
										case 'select':
											const attrs = (q.selectAttributes as string).split(',').map(a => a.trim()).filter(a => a);
											queries.push(Query.select(attrs));
											break;
										case 'orderAsc':
											queries.push(Query.orderAsc(attribute));
											break;
										case 'orderDesc':
											queries.push(Query.orderDesc(attribute));
											break;
									}
								}
							}
						}

						// Add limit if not returning all
						if (!returnAll) {
							const limit = this.getNodeParameter('limit', i) as number;
							queries.push(Query.limit(limit));
						}

						const response = await databases.listDocuments(databaseId, collectionId, queries);

						if (returnAll) {
							returnData.push(...response.documents as unknown as IDataObject[]);
						} else {
							returnData.push(response as unknown as IDataObject);
						}

					} else if (operation === 'create') {
						// Create Document
						let documentId = this.getNodeParameter('documentId', i) as string;
						const documentDataJson = this.getNodeParameter('documentData', i) as string;
						const permissionsJson = this.getNodeParameter('permissions', i, '[]') as string;

						// Parse document data - it should already be an object if using ={{ $json }}
						let documentData: IDataObject;
						if (typeof documentDataJson === 'object') {
							documentData = documentDataJson as IDataObject;
						} else {
							try {
								documentData = JSON.parse(documentDataJson as string);
							} catch (error) {
								throw new NodeOperationError(this.getNode(), 'Document Data must be valid JSON or an object', { itemIndex: i });
							}
						}

						// Parse permissions
						let permissions: string[];
						try {
							permissions = JSON.parse(permissionsJson);
							if (!Array.isArray(permissions)) {
								throw new NodeOperationError(this.getNode(), 'Permissions must be an array', { itemIndex: i });
							}
						} catch (error) {
							throw new NodeOperationError(this.getNode(), 'Permissions must be a valid JSON array', { itemIndex: i });
						}

						// Use ID.unique() if no document ID provided
						if (!documentId || documentId.trim() === '') {
							documentId = ID.unique();
						}

						const document = await databases.createDocument(
							databaseId,
							collectionId,
							documentId,
							documentData,
							permissions.length > 0 ? permissions : undefined,
						);
						returnData.push(document as unknown as IDataObject);
					}
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({ error: (error as Error).message });
					continue;
				}
				throw error;
			}
		}

		return [this.helpers.returnJsonArray(returnData)];
	}
}
