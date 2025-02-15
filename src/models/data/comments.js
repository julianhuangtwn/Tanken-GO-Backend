const { connectToDB } = require('./index');
const oracledb = require('oracledb');

async function addComment(userId, tripId, content, rating) {
    const connection = await connectToDB();
    
    //user is not rating their own trip
    const tripOwnerQuery = `SELECT USERID FROM ADMIN.TRIPCOMMENT WHERE TRIPID = :1`;
    const tripOwner = await connection.execute(tripOwnerQuery, [tripId]);

    if (tripOwner.rows.length > 0 && tripOwner.rows[0].USERID === userId) {
        throw new Error("You cannot rate your own trip.");
    }

    //check if user has already rated this trip
    const checkExistingRatingQuery = `
        SELECT COUNT(*) AS COUNT FROM ADMIN.TRIPCOMMENT WHERE USERID = :1 AND TRIPID = :2
    `;
    const existingRating = await connection.execute(checkExistingRatingQuery, [userId, tripId]);

    if (existingRating.rows[0][0] > 0) {
        throw new Error("You have already rated this trip.");
    }

    //get the highest existing COMMENTID and increment it by 1
    const getMaxCommentIdQuery = `SELECT MAX(COMMENTID) FROM ADMIN.TRIPCOMMENT`;
    const result = await connection.execute(getMaxCommentIdQuery);
    const newCommentId = (result.rows[0][0] || 0) + 1; // If no comments exist, start from 1

    //insert the new comment with the generated COMMENTID
    const insertQuery = `
        INSERT INTO ADMIN.TRIPCOMMENT (COMMENTID, USERID, TRIPID, CONTENT, RATING)
        VALUES (:1, :2, :3, :4, :5)
    `;
    
    await connection.execute(insertQuery, [newCommentId, userId, tripId, content, rating], { autoCommit: true });

    return { message: "Comment and rating added successfully!" };
}
async function getComments(tripId) {
    const connection = await connectToDB();
    
    const query = `
        SELECT 
            C.COMMENTID AS "COMMENTID", 
            C.CONTENT AS "CONTENT", 
            C.RATING AS "RATING", 
            C.USERID AS "USERID",  
            U.FIRST_NAME AS "FIRST_NAME", 
            U.LAST_NAME AS "LAST_NAME" 
        FROM ADMIN.TRIPCOMMENT C 
        JOIN ADMIN.TANKENUSERS U ON C.USERID = U.USERID
        WHERE C.TRIPID = :1
    `;

    const result = await connection.execute(query, [tripId], { outFormat: oracledb.OUT_FORMAT_OBJECT });

    console.log("Database Response:", result.rows); 
    return result.rows;
}
async function deleteComment(commentId, userId) {
    const connection = await connectToDB();

    const deleteQuery = `
        DELETE FROM ADMIN.TRIPCOMMENT WHERE COMMENTID = :1 AND USERID = :2
    `;

    const result = await connection.execute(deleteQuery, [commentId, userId], { autoCommit: true });

    if (result.rowsAffected === 0) {
        throw new Error("Comment not found or unauthorized.");
    }

    return { message: "Comment deleted successfully!" };
}


async function updateComment(commentId, userId, newContent, newRating) {
    const connection = await connectToDB();

    const updateQuery = `
        UPDATE ADMIN.TRIPCOMMENT 
        SET CONTENT = :1, RATING = :2 
        WHERE COMMENTID = :3 AND USERID = :4
    `;

    const result = await connection.execute(updateQuery, [newContent, newRating, commentId, userId], { autoCommit: true });

    if (result.rowsAffected === 0) {
        throw new Error("Comment not found or unauthorized.");
    }

    return { message: "Comment updated successfully!" };
}


module.exports = { addComment, getComments, updateComment, deleteComment };
