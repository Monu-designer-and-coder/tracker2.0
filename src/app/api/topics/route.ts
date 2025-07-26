// src/app/api/topics/route.ts
import { NextResponse } from 'next/server';
import TopicModel, { TopicModelInterface } from '@/model/topic.model';
import dbConn from '@/lib/dbConn';
import { TopicValidationSchema } from '@/schema/topic.schema';

// Create a new topic
export async function POST(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();

	// Validate the request body against the Zod schema
	const validationResult = TopicValidationSchema.safeParse(body);
	if (!validationResult.success) {
		// If validation fails, return a 400 response with the validation errors
		return NextResponse.json(
			{ errors: validationResult.error.errors },
			{ status: 400 },
		);
	}

	const topic = new TopicModel(body);
	await topic.save();
	return NextResponse.json<TopicModelInterface>(topic, { status: 201 });
}

// Get a single topic by ID
export async function GET(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	// Get all topics
	if (!searchParams.get('id')) {
		const topics = await TopicModel.find();
		return NextResponse.json<TopicModelInterface[]>(topics);
	}
	const id = searchParams.get('id');
	const topic = await TopicModel.findById(id);
	if (!topic)
		return NextResponse.json({ message: 'topic not found' }, { status: 404 });
	return NextResponse.json<TopicModelInterface>(topic);
}

// Update a topic by ID
export async function PUT(request: Request) {
	await dbConn(); // Connect to the database
	const body = await request.json();
	const { id } = body;
	const updatedTopic = await TopicModel.findByIdAndUpdate(id, body.data, {
		new: true,
	});
	if (!updatedTopic)
		return NextResponse.json({ message: 'topic not found' }, { status: 404 });
	return NextResponse.json<TopicModelInterface>(updatedTopic);
}

// Delete a topic by ID
export async function DELETE(request: Request) {
	await dbConn(); // Connect to the database
	const { searchParams } = new URL(request.url);
	const id = searchParams.get('id');
	const deletedTopic = await TopicModel.findByIdAndDelete(id);
	if (!deletedTopic)
		return NextResponse.json({ message: 'topic not found' }, { status: 404 });
	return NextResponse.json({
		message: 'topic deleted successfully',
	});
}
