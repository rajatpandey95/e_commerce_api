
// Example:-
// this way we can get aggregation pipeline of our choice from mongoDB atlas

const agg = [
    {
        '$match': {
            'product': new ObjectId('62bb445afd42739769adae99')
        }
    }, {
        '$group': {
            '_id': 'null',
            'averageRating': {
                '$avg': '$rating'
            },
            'numOfReviews': {
                '$sum': 1
            }
        }
    }
];
