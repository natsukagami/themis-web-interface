const assert = require('chai').assert;
const fs = require('fs');
const path = require('path');
const Log = require('../controls/judgelog').Log;

describe('Log', () => {
	describe('#parse', () => {
		it('Should parse a normal log without error', done => {
			fs.readFile(path.join(process.cwd(), 'tests', 'sample-log.log'), 'utf-8', (err, file) => {
				if (err) return done(err);
				const f = Log.__parse('asdf0001', 'LINES', file);
				assert.deepEqual(f, {
					verdict: 100,
					details: [
						{
							id: 'Test0001',
							score: 1,
							time: 0.035345205,
							verdict: 'Output: 6.\nAnswer: 6.'
						}, {
							id: 'Test0002',
							score: 1,
							time: 0.033979277,
							verdict: 'Output: 5.\nAnswer: 5.'
						}, {
							id: 'Test0003',
							score: 1,
							time: 0.035869937,
							verdict: 'Output: 2.\nAnswer: 2.'
						}, {
							id: 'Test004',
							score: 0,
							time: 0,
							verdict: 'Chạy sinh lỗi: Command: "C:\\ProgramData\\ThemisWorkSpace\\ContestRoom\\VO17BACH.exe" terminated with exit code: 3221225477 (Hexadecimal: C0000005)'
						}, {
							id: 'Test005',
							score: 0,
							time: 0,
							verdict: 'Chạy quá thời gian'
						}, {
							id: 'Test0006',
							score: 1,
							time: 0.024341235,
							verdict: 'Kết quả khớp đáp án!'
						}, {
							id: 'Test0007',
							score: 1,
							time: 0.024543243,
							verdict: 'Kết quả khớp đáp án!'
						}
					]
				}, 'Should be deeply equal to provided');
				done();
			});
		});
		it('Should parse a compile-error log without error', done => {
			fs.readFile(path.join(process.cwd(), 'tests', 'compile-error.log'), 'utf-8', (err, file) => {
				if (err) return done(err);
				const f = Log.__parse('dangcuong_123', 'HIGHWAY', file);
				assert.deepEqual(f, {
					verdict: 'ℱ Dịch lỗi',
					details: 'Command: "C:\\Program Files (x86)\\Themis\\gcc\\bin\\g++.exe" -o"HIGHWAY.exe" "HIGHWAY.cpp" -O2 -s -static -Wl,--stack,16777216 -lm -x c++ terminated with exit code: 1 (Hexadecimal: 1)\r\nHIGHWAY.cpp: In function \'bool LOC::onseg(const std::complex<int>&, const std::complex<int>&, const std::complex<int>&)\':\r\nHIGHWAY.cpp:26:50: error: \'inrange\' was not declared in this scope\r\n         inrange(a.x, min(b.x, c.x), max(b.x, c.x)) and\r\n                                                  ^\r\nHIGHWAY.cpp: In function \'bool LOC::intersect(const std::complex<int>&, const std::complex<int>&, const std::complex<int>&, const std::complex<int>&)\':\r\nHIGHWAY.cpp:31:38: error: \'sign\' was not declared in this scope\r\n     int o1 = sign(cross(b - a, c - a))\r\n                                      ^\r\nHIGHWAY.cpp:37:16: error: \'o2\' was not declared in this scope\r\n         (o1 != o2 and o3 != o4) or\r\n                ^\r\nHIGHWAY.cpp:37:23: error: \'o3\' was not declared in this scope\r\n         (o1 != o2 and o3 != o4) or\r\n                       ^\r\nHIGHWAY.cpp:37:29: error: \'o4\' was not declared in this scope\r\n         (o1 != o2 and o3 != o4) or\r\n                             ^\r\nHIGHWAY.cpp: In function \'int LOC::main()\':\r\nHIGHWAY.cpp:71:26: error: \'process\' was not declared in this scope\r\n         ii ans = process();\r\n                          ^\r\n'
				}, 'Should be deeply equal to provided');
				done();
			});
		});
	});
});
