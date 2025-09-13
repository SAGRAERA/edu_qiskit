module.exports = function stepExamples(context) {
  const { openExternal, loadStep } = context;
  const mainContent = document.getElementById("main-content");

  mainContent.innerHTML = `
    <div class="container" style="margin-bottom: 1rem; margin-top: -1rem;">
      <canvas class="canvas"></canvas>
      <p style="font-size: 1.2rem; margin-top: 0.5rem; font-weight: bold;">Qiskit Examples</p>
    </div>
    
    <h1 style="margin-bottom: 1.5rem;">Quantum Computing Examples</h1>
    
    <div style="margin-bottom: 2rem;">
      <button id="back-to-main" style="padding: 0.6rem 1.5rem; font-size: 1rem; background-color: #6c757d; color: white; border: none; border-radius: 4px;">← Back to Installation</button>
    </div>

    <div style="background-color: #e3f2fd; border: 1px solid #90caf9; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem;">
      <p style="margin: 0; color: #1565c0; font-size: 1.05rem;">Select an example below to see the code and explanation. You can copy the code and run it in your Python environment with Qiskit installed.</p>
    </div>

    <div id="examples-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
      
      <div class="example-card" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;" data-example="bell-state">
        <h3 style="margin: 0 0 0.5rem 0; color: #495057;">🔗 Bell State</h3>
        <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">Create quantum entanglement between two qubits using the Bell state circuit.</p>
        <span style="color: #007bff; font-size: 0.9rem;">Click to view →</span>
      </div>

      <div class="example-card" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;" data-example="teleportation">
        <h3 style="margin: 0 0 0.5rem 0; color: #495057;">🚀 Quantum Teleportation</h3>
        <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">Transfer quantum information from one qubit to another using entanglement.</p>
        <span style="color: #007bff; font-size: 0.9rem;">Click to view →</span>
      </div>

      <div class="example-card" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;" data-example="grover">
        <h3 style="margin: 0 0 0.5rem 0; color: #495057;">🔍 Grover's Algorithm</h3>
        <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">Search an unsorted database quadratically faster than classical algorithms.</p>
        <span style="color: #007bff; font-size: 0.9rem;">Click to view →</span>
      </div>

      <div class="example-card" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;" data-example="vqe">
        <h3 style="margin: 0 0 0.5rem 0; color: #495057;">⚛️ VQE</h3>
        <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">Find the ground state energy of molecules using the Variational Quantum Eigensolver.</p>
        <span style="color: #007bff; font-size: 0.9rem;">Click to view →</span>
      </div>

      <div class="example-card" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;" data-example="qft">
        <h3 style="margin: 0 0 0.5rem 0; color: #495057;">🌊 Quantum Fourier Transform</h3>
        <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">The quantum version of the discrete Fourier transform, crucial for many quantum algorithms.</p>
        <span style="color: #007bff; font-size: 0.9rem;">Click to view →</span>
      </div>

      <div class="example-card" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;" data-example="qaoa">
        <h3 style="margin: 0 0 0.5rem 0; color: #495057;">📊 QAOA</h3>
        <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">Solve combinatorial optimization problems using the Quantum Approximate Optimization Algorithm.</p>
        <span style="color: #007bff; font-size: 0.9rem;">Click to view →</span>
      </div>

      <div class="example-card" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;" data-example="superdense">
        <h3 style="margin: 0 0 0.5rem 0; color: #495057;">📡 Superdense Coding</h3>
        <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">Send two classical bits using only one qubit through quantum entanglement.</p>
        <span style="color: #007bff; font-size: 0.9rem;">Click to view →</span>
      </div>

      <div class="example-card" style="background-color: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 1.5rem; cursor: pointer; transition: all 0.3s;" data-example="deutsch">
        <h3 style="margin: 0 0 0.5rem 0; color: #495057;">🎯 Deutsch-Jozsa Algorithm</h3>
        <p style="margin: 0; color: #6c757d; font-size: 0.95rem;">Determine if a function is constant or balanced with just one evaluation.</p>
        <span style="color: #007bff; font-size: 0.9rem;">Click to view →</span>
      </div>
    </div>

    <div id="example-detail" style="display: none;">
      <div style="background-color: white; border: 2px solid #dee2e6; border-radius: 8px; padding: 2rem; margin-top: 2rem;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <h2 id="example-title" style="margin: 0;"></h2>
          <button id="close-example" style="padding: 0.5rem 1rem; font-size: 0.9rem; background-color: #dc3545; color: white; border: none; border-radius: 4px;">Close ✕</button>
        </div>
        
        <div id="example-description" style="background-color: #f8f9fa; border-radius: 4px; padding: 1rem; margin-bottom: 1.5rem;"></div>
        
        <div style="margin-bottom: 1rem;">
          <h3>Code:</h3>
          <div style="position: relative;">
            <button id="copy-code" style="position: absolute; top: 10px; right: 10px; padding: 0.4rem 0.8rem; font-size: 0.85rem; background-color: #28a745; color: white; border: none; border-radius: 4px;">Copy Code</button>
            <pre id="example-code" style="background-color: #1e1e1e; color: #d4d4d4; padding: 1.5rem; border-radius: 4px; overflow-x: auto; font-family: 'Courier New', monospace; font-size: 0.9rem;"></pre>
          </div>
        </div>
        
        <div id="example-explanation" style="margin-top: 1.5rem;"></div>
        
        <div style="margin-top: 1.5rem;">
          <button id="open-docs-link" style="padding: 0.6rem 1.5rem; font-size: 1rem; background-color: #007bff; color: white; border: none; border-radius: 4px; margin-right: 1rem;">View Full Documentation</button>
          <button id="run-in-composer" style="padding: 0.6rem 1.5rem; font-size: 1rem; background-color: #17a2b8; color: white; border: none; border-radius: 4px;">Try in IBM Quantum Composer</button>
        </div>
      </div>
    </div>
  `;

  // Examples data
  const examples = {
    'bell-state': {
      title: '🔗 Bell State Creation',
      description: 'The Bell state is a maximally entangled quantum state of two qubits. It demonstrates quantum entanglement, where measuring one qubit instantly affects the other.',
      code: `from qiskit import QuantumCircuit
from qiskit.quantum_info import Statevector
from qiskit.visualization import plot_histogram
from qiskit_aer import AerSimulator

# Create a quantum circuit with 2 qubits
qc = QuantumCircuit(2, 2)

# Create Bell state: |Φ+⟩ = (|00⟩ + |11⟩) / √2
qc.h(0)      # Put qubit 0 in superposition
qc.cx(0, 1)  # Entangle qubit 0 with qubit 1

# Add measurements
qc.measure([0, 1], [0, 1])

# Visualize the circuit
print(qc.draw())

# Run the circuit on a simulator
simulator = AerSimulator()
job = simulator.run(qc, shots=1000)
result = job.result()
counts = result.get_counts(qc)

# Plot the results
plot_histogram(counts)`,
      explanation: `<h4>How it works:</h4>
        <ol>
          <li><strong>Hadamard Gate (H):</strong> Places the first qubit in superposition state (|0⟩ + |1⟩)/√2</li>
          <li><strong>CNOT Gate (CX):</strong> Creates entanglement between the two qubits</li>
          <li><strong>Result:</strong> The qubits are now in the Bell state |Φ+⟩ = (|00⟩ + |11⟩)/√2</li>
          <li><strong>Measurement:</strong> You'll observe either |00⟩ or |11⟩ with 50% probability each</li>
        </ol>`,
      docsLink: 'https://docs.quantum.ibm.com/build/circuit-library#bell-state',
      composerLink: 'https://quantum.ibm.com/composer'
    },
    'teleportation': {
      title: '🚀 Quantum Teleportation',
      description: 'Quantum teleportation transfers the quantum state of one qubit to another using entanglement and classical communication.',
      code: `from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import numpy as np

# Create quantum and classical registers
qr = QuantumRegister(3, 'q')
cr = ClassicalRegister(3, 'c')
qc = QuantumCircuit(qr, cr)

# Prepare the state to teleport (example: |+⟩ state)
qc.h(qr[0])

# Create entangled pair between Alice and Bob
qc.h(qr[1])
qc.cx(qr[1], qr[2])

qc.barrier()

# Alice's operations
qc.cx(qr[0], qr[1])
qc.h(qr[0])
qc.measure(qr[0], cr[0])
qc.measure(qr[1], cr[1])

qc.barrier()

# Bob's operations (conditioned on Alice's measurements)
qc.cx(qr[1], qr[2])
qc.cz(qr[0], qr[2])

# Measure Bob's qubit
qc.measure(qr[2], cr[2])

print(qc.draw())

# Run simulation
simulator = AerSimulator()
job = simulator.run(qc, shots=1000)
result = job.result()
counts = result.get_counts(qc)

plot_histogram(counts)`,
      explanation: `<h4>Teleportation Protocol:</h4>
        <ol>
          <li><strong>Initial State:</strong> Alice has a qubit in an unknown state to teleport</li>
          <li><strong>Entanglement:</strong> Create a Bell pair shared between Alice and Bob</li>
          <li><strong>Bell Measurement:</strong> Alice performs a Bell measurement on her two qubits</li>
          <li><strong>Classical Communication:</strong> Alice sends her measurement results to Bob</li>
          <li><strong>State Recovery:</strong> Bob applies corrections based on Alice's measurements</li>
          <li><strong>Result:</strong> Bob's qubit now has the original state that Alice wanted to send</li>
        </ol>`,
      docsLink: 'https://learning.quantum.ibm.com/tutorial/quantum-teleportation',
      composerLink: 'https://quantum.ibm.com/composer'
    },
    'grover': {
      title: '🔍 Grover\'s Search Algorithm',
      description: 'Grover\'s algorithm provides a quadratic speedup for searching unsorted databases compared to classical algorithms.',
      code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import numpy as np

def grover_oracle(marked_states):
    """Build a Grover oracle for marked states"""
    num_qubits = len(marked_states[0])
    qc = QuantumCircuit(num_qubits)
    
    # Mark the target states
    for target in marked_states:
        # Add X gates for 0s in target state
        for i, bit in enumerate(target):
            if bit == '0':
                qc.x(i)
        
        # Multi-controlled Z gate
        qc.h(num_qubits-1)
        qc.mcx(list(range(num_qubits-1)), num_qubits-1)
        qc.h(num_qubits-1)
        
        # Undo X gates
        for i, bit in enumerate(target):
            if bit == '0':
                qc.x(i)
    
    return qc

def diffusion_operator(num_qubits):
    """Build the diffusion operator"""
    qc = QuantumCircuit(num_qubits)
    
    # Apply H gates
    qc.h(range(num_qubits))
    
    # Apply X gates
    qc.x(range(num_qubits))
    
    # Multi-controlled Z
    qc.h(num_qubits-1)
    qc.mcx(list(range(num_qubits-1)), num_qubits-1)
    qc.h(num_qubits-1)
    
    # Apply X gates
    qc.x(range(num_qubits))
    
    # Apply H gates
    qc.h(range(num_qubits))
    
    return qc

# Create Grover's algorithm for 3 qubits, searching for |101⟩
n_qubits = 3
grover_circuit = QuantumCircuit(n_qubits, n_qubits)

# Initialize in superposition
grover_circuit.h(range(n_qubits))

# Number of Grover iterations
iterations = int(np.pi/4 * np.sqrt(2**n_qubits))

# Apply Grover operator
oracle = grover_oracle(['101'])
diffusion = diffusion_operator(n_qubits)

for _ in range(iterations):
    grover_circuit.append(oracle, range(n_qubits))
    grover_circuit.append(diffusion, range(n_qubits))

# Measure
grover_circuit.measure(range(n_qubits), range(n_qubits))

print(grover_circuit.draw())

# Run simulation
simulator = AerSimulator()
job = simulator.run(grover_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

plot_histogram(counts)`,
      explanation: `<h4>Algorithm Steps:</h4>
        <ol>
          <li><strong>Initialization:</strong> Put all qubits in equal superposition using Hadamard gates</li>
          <li><strong>Oracle:</strong> Mark the target state(s) with a phase flip</li>
          <li><strong>Diffusion:</strong> Amplify the amplitude of marked states</li>
          <li><strong>Iteration:</strong> Repeat Oracle and Diffusion ~√N times (N = search space size)</li>
          <li><strong>Measurement:</strong> The marked state has high probability of being measured</li>
          <li><strong>Speedup:</strong> O(√N) vs O(N) for classical search</li>
        </ol>`,
      docsLink: 'https://learning.quantum.ibm.com/tutorial/grovers-algorithm',
      composerLink: 'https://quantum.ibm.com/composer'
    },
    'vqe': {
      title: '⚛️ Variational Quantum Eigensolver (VQE)',
      description: 'VQE is a hybrid quantum-classical algorithm used to find the ground state energy of molecular Hamiltonians.',
      code: `from qiskit import QuantumCircuit
from qiskit.circuit.library import TwoLocal
from qiskit_aer import AerSimulator
from qiskit.primitives import Estimator
from qiskit.quantum_info import SparsePauliOp
from scipy.optimize import minimize
import numpy as np

# Define the Hamiltonian for H2 molecule
H2_op = SparsePauliOp.from_list([
    ("II", -1.052373245772859),
    ("IZ", 0.39793742484318045),
    ("ZI", -0.39793742484318045),
    ("ZZ", -0.01128010425623538),
    ("XX", 0.18093119978423156)
])

# Create ansatz (parameterized circuit)
num_qubits = 2
ansatz = TwoLocal(num_qubits, 'ry', 'cz', 'linear', reps=2)

# Define cost function
def cost_func(params, ansatz, hamiltonian, estimator):
    """Calculate expectation value"""
    job = estimator.run(ansatz, hamiltonian, parameter_values=params)
    result = job.result()
    return result.values[0]

# Initialize parameters
initial_params = np.random.random(ansatz.num_parameters) * 2 * np.pi

# Set up the estimator
estimator = Estimator()

# Optimize
result = minimize(
    cost_func,
    initial_params,
    args=(ansatz, H2_op, estimator),
    method='COBYLA',
    options={'maxiter': 100}
)

print(f"VQE Result: {result.fun:.8f}")
print(f"Optimal parameters: {result.x}")

# Create the optimized circuit
optimal_circuit = ansatz.bind_parameters(result.x)
print(optimal_circuit.draw())`,
      explanation: `<h4>VQE Components:</h4>
        <ol>
          <li><strong>Ansatz:</strong> A parameterized quantum circuit that represents trial wavefunctions</li>
          <li><strong>Hamiltonian:</strong> The molecular Hamiltonian expressed as Pauli operators</li>
          <li><strong>Classical Optimizer:</strong> Adjusts circuit parameters to minimize energy</li>
          <li><strong>Expectation Value:</strong> Measure ⟨ψ(θ)|H|ψ(θ)⟩ for current parameters</li>
          <li><strong>Iteration:</strong> Repeat until convergence to find ground state energy</li>
          <li><strong>Applications:</strong> Quantum chemistry, materials science, drug discovery</li>
        </ol>`,
      docsLink: 'https://learning.quantum.ibm.com/tutorial/variational-quantum-eigensolver',
      composerLink: 'https://quantum.ibm.com/composer'
    },
    'qft': {
      title: '🌊 Quantum Fourier Transform',
      description: 'The QFT is the quantum analog of the discrete Fourier transform, essential for many quantum algorithms including Shor\'s algorithm.',
      code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram, plot_bloch_multivector
from qiskit.quantum_info import Statevector
import numpy as np

def qft_rotations(circuit, n):
    """Performs qft on the first n qubits in circuit"""
    if n == 0:
        return circuit
    n -= 1
    circuit.h(n)
    for qubit in range(n):
        circuit.cp(np.pi/2**(n-qubit), qubit, n)
    qft_rotations(circuit, n)

def swap_registers(circuit, n):
    """Swap the registers"""
    for qubit in range(n//2):
        circuit.swap(qubit, n-qubit-1)
    return circuit

def qft(circuit, n):
    """QFT on the first n qubits in circuit"""
    qft_rotations(circuit, n)
    swap_registers(circuit, n)
    return circuit

# Create circuit
num_qubits = 4
qc = QuantumCircuit(num_qubits)

# Prepare an input state (example: |0101⟩)
qc.x(0)
qc.x(2)

qc.barrier()

# Apply QFT
qft(qc, num_qubits)

qc.barrier()

# Add measurements
qc.measure_all()

print("QFT Circuit:")
print(qc.draw())

# Simulate
simulator = AerSimulator()
job = simulator.run(qc, shots=1000)
result = job.result()
counts = result.get_counts()

plot_histogram(counts)

# Show the state vector (without measurement)
qc_no_measure = QuantumCircuit(num_qubits)
qc_no_measure.x(0)
qc_no_measure.x(2)
qft(qc_no_measure, num_qubits)

state = Statevector(qc_no_measure)
print("\\nState vector after QFT:")
print(state)`,
      explanation: `<h4>QFT Properties:</h4>
        <ol>
          <li><strong>Transform:</strong> Maps computational basis to frequency basis</li>
          <li><strong>Circuit Depth:</strong> O(n²) gates for n qubits</li>
          <li><strong>Key Gates:</strong> Hadamard and controlled phase rotations</li>
          <li><strong>Applications:</strong> Period finding, phase estimation, Shor's algorithm</li>
          <li><strong>Efficiency:</strong> Exponentially faster than classical FFT for certain problems</li>
          <li><strong>Inverse QFT:</strong> Run the circuit in reverse order with conjugate phases</li>
        </ol>`,
      docsLink: 'https://qiskit.org/textbook/ch-algorithms/quantum-fourier-transform.html',
      composerLink: 'https://quantum.ibm.com/composer'
    },
    'qaoa': {
      title: '📊 Quantum Approximate Optimization Algorithm',
      description: 'QAOA solves combinatorial optimization problems by encoding them into quantum states and finding optimal parameters.',
      code: `from qiskit import QuantumCircuit
from qiskit.circuit import Parameter
from qiskit_aer import AerSimulator
from qiskit.primitives import Sampler
from qiskit.quantum_info import SparsePauliOp
import numpy as np
from scipy.optimize import minimize

# MaxCut problem for a triangle graph
edges = [(0, 1), (1, 2), (0, 2)]
num_qubits = 3

def create_qaoa_circuit(gamma, beta, edges, num_qubits):
    """Create QAOA circuit for MaxCut"""
    qc = QuantumCircuit(num_qubits)
    
    # Initial state: equal superposition
    qc.h(range(num_qubits))
    
    # Cost Hamiltonian layer (problem-specific)
    for i, j in edges:
        qc.rzz(2 * gamma, i, j)
    
    # Mixer Hamiltonian layer
    for i in range(num_qubits):
        qc.rx(2 * beta, i)
    
    return qc

def maxcut_objective(x, edges, num_qubits):
    """Compute MaxCut objective function"""
    gamma, beta = x
    
    # Create circuit
    qc = create_qaoa_circuit(gamma, beta, edges, num_qubits)
    qc.measure_all()
    
    # Run simulation
    simulator = AerSimulator()
    job = simulator.run(qc, shots=1000)
    counts = job.result().get_counts()
    
    # Calculate expectation value
    avg = 0
    for bitstring, count in counts.items():
        obj = 0
        for i, j in edges:
            if bitstring[i] != bitstring[j]:
                obj += 1
        avg += obj * count / 1000
    
    return -avg  # Minimize negative for maximization

# Initialize parameters
init_params = np.random.uniform(0, np.pi, 2)

# Optimize
result = minimize(
    maxcut_objective,
    init_params,
    args=(edges, num_qubits),
    method='COBYLA',
    options={'maxiter': 50}
)

print(f"Optimal parameters: gamma={result.x[0]:.4f}, beta={result.x[1]:.4f}")
print(f"Maximum cut value: {-result.fun:.4f}")

# Create and display optimized circuit
optimal_qc = create_qaoa_circuit(result.x[0], result.x[1], edges, num_qubits)
optimal_qc.measure_all()
print("\\nOptimized QAOA Circuit:")
print(optimal_qc.draw())

# Run final simulation
simulator = AerSimulator()
job = simulator.run(optimal_qc, shots=1000)
counts = job.result().get_counts()

print("\\nFinal measurement results:")
for state, count in sorted(counts.items(), key=lambda x: x[1], reverse=True)[:5]:
    print(f"  |{state}⟩: {count/10:.1f}%")`,
      explanation: `<h4>QAOA Framework:</h4>
        <ol>
          <li><strong>Problem Encoding:</strong> Map optimization problem to Ising Hamiltonian</li>
          <li><strong>Ansatz:</strong> Alternating layers of cost and mixer Hamiltonians</li>
          <li><strong>Parameters:</strong> γ (gamma) for cost layer, β (beta) for mixer layer</li>
          <li><strong>Classical Loop:</strong> Optimize parameters to maximize/minimize objective</li>
          <li><strong>Depth:</strong> More layers (p) generally give better approximations</li>
          <li><strong>Applications:</strong> MaxCut, graph coloring, portfolio optimization</li>
        </ol>`,
      docsLink: 'https://learning.quantum.ibm.com/course/variational-algorithm-design',
      composerLink: 'https://quantum.ibm.com/composer'
    },
    'superdense': {
      title: '📡 Superdense Coding',
      description: 'Send two classical bits of information using only one qubit, leveraging quantum entanglement.',
      code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram

def superdense_coding(message):
    """
    Encode and decode a 2-bit message using superdense coding
    message: string of two bits ('00', '01', '10', or '11')
    """
    # Create circuit with 2 qubits
    qc = QuantumCircuit(2, 2)
    
    # Step 1: Create entangled pair (shared between Alice and Bob)
    qc.h(0)
    qc.cx(0, 1)
    qc.barrier()
    
    # Step 2: Alice encodes her message
    if message == '00':
        # Do nothing (Identity)
        pass
    elif message == '01':
        # Apply X gate
        qc.x(0)
    elif message == '10':
        # Apply Z gate
        qc.z(0)
    elif message == '11':
        # Apply X and Z gates
        qc.x(0)
        qc.z(0)
    
    qc.barrier()
    
    # Step 3: Bob decodes the message
    qc.cx(0, 1)
    qc.h(0)
    
    # Step 4: Measure both qubits
    qc.measure([0, 1], [0, 1])
    
    return qc

# Test all possible messages
messages = ['00', '01', '10', '11']
simulator = AerSimulator()

for message in messages:
    print(f"\\nSending message: {message}")
    
    # Create circuit
    qc = superdense_coding(message)
    print(qc.draw())
    
    # Simulate
    job = simulator.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts()
    
    # The measurement should always give us back our message
    print(f"Received: {list(counts.keys())[0][::-1]}")
    print(f"Success rate: {max(counts.values())/10:.1f}%")

# Demonstrate with visualization
qc_visual = superdense_coding('11')
print("\\nComplete Superdense Coding Circuit for message '11':")
print(qc_visual.draw())`,
      explanation: `<h4>Protocol Steps:</h4>
        <ol>
          <li><strong>Entanglement:</strong> Create a Bell pair shared between Alice and Bob</li>
          <li><strong>Encoding:</strong> Alice applies gates based on her 2-bit message:
            <ul>
              <li>'00' → I (nothing)</li>
              <li>'01' → X gate</li>
              <li>'10' → Z gate</li>
              <li>'11' → XZ gates</li>
            </ul>
          </li>
          <li><strong>Transmission:</strong> Alice sends her qubit to Bob (1 qubit sent)</li>
          <li><strong>Decoding:</strong> Bob applies CNOT and H to retrieve the message</li>
          <li><strong>Result:</strong> 2 classical bits transmitted using 1 qubit</li>
        </ol>`,
      docsLink: 'https://qiskit.org/textbook/ch-algorithms/superdense-coding.html',
      composerLink: 'https://quantum.ibm.com/composer'
    },
    'deutsch': {
      title: '🎯 Deutsch-Jozsa Algorithm',
      description: 'Determine whether a function is constant or balanced with just one quantum evaluation, compared to 2^(n-1)+1 classical evaluations.',
      code: `from qiskit import QuantumCircuit
from qiskit_aer import AerSimulator
from qiskit.visualization import plot_histogram
import numpy as np

def deutsch_jozsa_oracle(case, num_qubits):
    """
    Create an oracle for Deutsch-Jozsa algorithm
    case: 'constant_0', 'constant_1', 'balanced_1', or 'balanced_2'
    """
    oracle = QuantumCircuit(num_qubits + 1)
    
    if case == 'constant_0':
        # f(x) = 0 for all x
        pass  # Do nothing
    
    elif case == 'constant_1':
        # f(x) = 1 for all x
        oracle.x(num_qubits)
    
    elif case == 'balanced_1':
        # f(x) = 1 for half of inputs (when last bit is 1)
        oracle.cx(num_qubits-1, num_qubits)
    
    elif case == 'balanced_2':
        # f(x) = 1 for half of inputs (when parity is odd)
        for qubit in range(num_qubits):
            oracle.cx(qubit, num_qubits)
    
    return oracle

def deutsch_jozsa_algorithm(oracle, num_qubits):
    """
    Complete Deutsch-Jozsa algorithm
    """
    # Create circuit with n+1 qubits (n input + 1 ancilla)
    qc = QuantumCircuit(num_qubits + 1, num_qubits)
    
    # Initialize ancilla qubit to |1⟩
    qc.x(num_qubits)
    
    # Apply Hadamard gates to all qubits
    for qubit in range(num_qubits + 1):
        qc.h(qubit)
    
    qc.barrier()
    
    # Apply the oracle
    qc.append(oracle, range(num_qubits + 1))
    
    qc.barrier()
    
    # Apply Hadamard gates to input qubits
    for qubit in range(num_qubits):
        qc.h(qubit)
    
    # Measure input qubits
    qc.measure(range(num_qubits), range(num_qubits))
    
    return qc

# Test different oracle types
num_input_qubits = 3
test_cases = [
    ('constant_0', 'Constant (always 0)'),
    ('constant_1', 'Constant (always 1)'),
    ('balanced_1', 'Balanced (pattern 1)'),
    ('balanced_2', 'Balanced (pattern 2)')
]

simulator = AerSimulator()

for case, description in test_cases:
    print(f"\\nTesting {description} function:")
    
    # Create oracle and algorithm
    oracle = deutsch_jozsa_oracle(case, num_input_qubits)
    qc = deutsch_jozsa_algorithm(oracle, num_input_qubits)
    
    # Run simulation
    job = simulator.run(qc, shots=1000)
    result = job.result()
    counts = result.get_counts()
    
    # Interpret results
    if len(counts) == 1 and '000' in counts:
        print("  Result: Function is CONSTANT")
    else:
        print("  Result: Function is BALANCED")
    
    print(f"  Measurement outcomes: {counts}")

# Display one complete circuit
oracle_example = deutsch_jozsa_oracle('balanced_1', num_input_qubits)
qc_example = deutsch_jozsa_algorithm(oracle_example, num_input_qubits)
print("\\nComplete Deutsch-Jozsa Circuit (Balanced Oracle):")
print(qc_example.draw())`,
      explanation: `<h4>Algorithm Advantages:</h4>
        <ol>
          <li><strong>Problem:</strong> Determine if f(x) is constant or balanced</li>
          <li><strong>Classical:</strong> Worst case needs 2^(n-1)+1 function evaluations</li>
          <li><strong>Quantum:</strong> Always needs exactly 1 function evaluation</li>
          <li><strong>Key Insight:</strong> Quantum parallelism evaluates all inputs simultaneously</li>
          <li><strong>Result Interpretation:</strong>
            <ul>
              <li>All zeros measured → Function is constant</li>
              <li>Any non-zero measured → Function is balanced</li>
            </ul>
          </li>
          <li><strong>Significance:</strong> First algorithm showing quantum advantage</li>
        </ol>`,
      docsLink: 'https://qiskit.org/textbook/ch-algorithms/deutsch-jozsa.html',
      composerLink: 'https://quantum.ibm.com/composer'
    }
  };

  // Add hover effects
  const cards = document.querySelectorAll('.example-card');
  cards.forEach(card => {
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px)';
      this.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0)';
      this.style.boxShadow = 'none';
    });
    
    card.addEventListener('click', function() {
      const exampleKey = this.dataset.example;
      showExample(exampleKey);
    });
  });

  // Show example details
  function showExample(key) {
    const example = examples[key];
    if (!example) return;
    
    document.getElementById('examples-grid').style.display = 'none';
    document.getElementById('example-detail').style.display = 'block';
    
    document.getElementById('example-title').textContent = example.title;
    document.getElementById('example-description').textContent = example.description;
    document.getElementById('example-code').textContent = example.code;
    document.getElementById('example-explanation').innerHTML = example.explanation;
    
    // Set up documentation link
    document.getElementById('open-docs-link').onclick = () => openExternal(example.docsLink);
    document.getElementById('run-in-composer').onclick = () => openExternal(example.composerLink);
  }

  // Copy code functionality
  document.getElementById('copy-code').addEventListener('click', function() {
    const codeElement = document.getElementById('example-code');
    navigator.clipboard.writeText(codeElement.textContent).then(() => {
      this.textContent = 'Copied!';
      this.style.backgroundColor = '#6c757d';
      setTimeout(() => {
        this.textContent = 'Copy Code';
        this.style.backgroundColor = '#28a745';
      }, 2000);
    });
  });

  // Close example
  document.getElementById('close-example').addEventListener('click', function() {
    document.getElementById('example-detail').style.display = 'none';
    document.getElementById('examples-grid').style.display = 'grid';
  });

  // Back to main button
  document.getElementById('back-to-main').addEventListener('click', () => {
    loadStep('step1');
  });
};