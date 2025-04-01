from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models.user import User

auth_bp = Blueprint('auth', __name__, url_prefix='/api')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    
    if not username or not email or not password:
        return jsonify({"error": "Username, email, and password are required"}), 400
    
    try:
        user_id, error = User.create(username, email, password)
        
        if error:
            return jsonify({"error": error}), 409
        
        # Create access token
        access_token = create_access_token(identity=username)
        
        return jsonify({
            "message": "User registered successfully",
            "user_id": user_id,
            "access_token": access_token
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400
    
    try:
        user = User.find_by_username(username)
        
        if not user or not User.verify_password(user[3], password):
            return jsonify({"error": "Invalid username or password"}), 401
        
        # Update last login time
        User.update_last_login(user[0])
        
        # Create access token
        access_token = create_access_token(identity=username)
        
        return jsonify({
            "message": "Login successful",
            "user_id": user[0],
            "username": user[1],
            "access_token": access_token
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user():
    current_user = get_jwt_identity()
    
    try:
        user = User.find_by_username(current_user)
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        return jsonify({
            "id": user[0],
            "username": user[1],
            "email": user[2],
            "created_at": user[4]
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@auth_bp.route('/logout', methods=['POST'])
def logout():
    # JWT is stateless, so we don't need to do anything server-side
    # The client will handle removing the token
    return jsonify({"message": "Logout successful"})